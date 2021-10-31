use justchat_api::entities::BuildInfo;
use justchat_api::env::load as load_env;
use justchat_api::env::var as env_var;
use justchat_api::env::var_or as env_var_or;
use justchat_api::graph::{Mutation, Query, Subscription};
use justchat_api::services::Config as ServicesConfig;
use justchat_api::services::{Services, Settings};
use justchat_api::util::default;

use std::borrow::Cow;
use std::convert::Infallible;
use std::env::VarError as EnvVarError;
use std::net::SocketAddr;

use anyhow::Context as AnyhowContext;
use anyhow::Result;

use http::header::CONTENT_TYPE;
use http::method::Method;
use http::{Response, StatusCode};

use warp::cors;
use warp::path::end as path_end;
use warp::reject::custom as rejection;
use warp::reject::Reject;
use warp::reply::json as reply_json;
use warp::reply::with_status as reply_with_status;
use warp::{get, head, path, serve};
use warp::{Filter, Rejection, Reply};

use graphql::extensions::apollo_persisted_queries as graphql_apq;
use graphql::http::playground_source as graphql_playground_source;
use graphql::http::GraphQLPlaygroundConfig;
use graphql::Request as GraphQLRequest;
use graphql::Response as GraphQLResponse;
use graphql::Schema;
use graphql::ServerError as GraphQLError;

use graphql_apq::ApolloPersistedQueries as GraphQLAPQExtension;
use graphql_apq::LruCacheStorage as GraphQLAPQStorage;

use graphql_warp::graphql as warp_graphql;
use graphql_warp::graphql_subscription as warp_graphql_subscription;
use graphql_warp::BadRequest as WarpGraphQLBadRequest;
use graphql_warp::Response as WarpGraphQLResponse;

use mongodb::options::ClientOptions as MongoClientOptions;
use mongodb::Client as MongoClient;

use tracing::{debug, error, info};
use tracing_subscriber::fmt::layer as fmt_tracing_layer;
use tracing_subscriber::layer::SubscriberExt as TracingSubscriberLayerExt;
use tracing_subscriber::registry as tracing_registry;
use tracing_subscriber::util::SubscriberInitExt as TracingSubscriberInitExt;
use tracing_subscriber::EnvFilter as TracingEnvFilter;

use sentry::init as init_sentry;
use sentry::ClientOptions as SentryOptions;
use sentry::IntoDsn as IntoSentryDsn;
use sentry_tracing::layer as sentry_tracing_layer;

use serde::Serialize;
use serde_json::to_string as to_json_string;

use anyhow::Error;
use bson::doc;
use chrono::{DateTime, FixedOffset};
use tokio::main as tokio;

#[tokio]
async fn main() -> Result<()> {
    // Load environment variables
    load_env().context("failed to load environment variables")?;

    // Initialize tracing subscriber
    debug!(target: "justchat-api", "initializing tracing subscriber");
    {
        let env_filter_layer = TracingEnvFilter::from_env("JUSTCHAT_API_LOG");
        tracing_registry()
            .with(env_filter_layer)
            .with(fmt_tracing_layer())
            .with(sentry_tracing_layer())
            .try_init()
            .context("failed to initialize tracing subscriber")?;
    }

    let environment = match env_var("JUSTCHAT_ENV") {
        Ok(environment) => Some(environment),
        Err(EnvVarError::NotPresent) => None,
        Err(error) => {
            return Err(error)
                .context("failed to read environment variable JUSTCHAT_ENV")
        }
    };

    // Initialize Sentry (if SENTRY_DSN is set)
    let _guard = match env_var("JUSTCHAT_API_SENTRY_DSN") {
        Ok(dsn) => {
            debug!(target: "justchat-api", "initializing Sentry");
            let dsn = dsn.into_dsn().context("failed to parse Sentry DSN")?;
            let options = SentryOptions {
                dsn,
                environment: environment.clone().map(Into::into),
                ..default()
            };
            let guard = init_sentry(options);
            Some(guard)
        }
        Err(EnvVarError::NotPresent) => None,
        Err(error) => {
            return Err(error)
                .context("failed to read environment variable SENTRY_DSN")
        }
    };

    // Read build info
    let build = {
        let timestamp = DateTime::<FixedOffset>::parse_from_rfc3339(env!(
            "BUILD_TIMESTAMP"
        ))
        .context("failed to parse build timestamp")?;
        let version = env!("CARGO_PKG_VERSION").to_owned();
        BuildInfo { timestamp, version }
    };

    // Connect to database
    info!(target: "justchat-api", "connecting to database");
    let database_client = {
        let uri = env_var_or("MONGO_URI", "mongodb://localhost:27017")
            .context("failed to read environment variable MONGO_URI")?;
        let options = {
            let mut options = MongoClientOptions::parse(uri)
                .await
                .context("failed to parse MongoDB connection string")?;
            options.retry_writes = true.into();
            options
        };
        MongoClient::with_options(options)
            .context("failed to build MongoDB client")?
    };

    let database = {
        let name = env_var_or("MONGO_DATABASE", "justchat")
            .context("failed to read environment variable MONGO_DATABASE")?;
        let database = database_client.database(&name);
        database
            .run_command(doc! { "ping": 1 }, None)
            .await
            .context("failed to connect to MongoDB")?;
        database
    };

    info!(target: "justchat-api", "initializing services");

    // Build settings
    let settings = Settings::builder()
        .web_public_url({
            let url = env_var("JUSTCHAT_WEB_PUBLIC_URL").context(
                "failed to read environment variable JUSTCHAT_WEB_PUBLIC_URL",
            )?;
            url.parse()
                .context("failed to parse justchat-web public URL")?
        })
        .api_public_url({
            let url = env_var("JUSTCHAT_API_PUBLIC_URL").context(
                "failed to read environment variable JUSTCHAT_API_PUBLIC_URL",
            )?;
            url.parse()
                .context("failed to parse justchat-api public URL")?
        })
        .build();

    // Build services
    let services = {
        let config = ServicesConfig::builder()
            .database_client(database_client)
            .database(database)
            .settings(settings)
            .build();
        Services::new(config)
    };

    // Build GraphQL schema
    let graphql_schema = {
        let query = Query::new();
        let mutation = Mutation::new();
        let subscription = Subscription::new();
        Schema::build(query, mutation, subscription)
            .extension({
                let storage = GraphQLAPQStorage::new(1024);
                GraphQLAPQExtension::new(storage)
            })
            .data(build)
            .data(services.clone())
            .finish()
    };

    // Build GraphQL filter
    let graphql_filter = {
        let graphql = {
            warp_graphql(graphql_schema.clone()).untuple_one().and_then(
                |schema: Schema<_, _, _>, request: GraphQLRequest| async move {
                    let response = schema.execute(request).await;
                    trace_graphql_response(&response);
                    let response = WarpGraphQLResponse::from(response);
                    Ok::<_, Infallible>(response)
                },
            )
        };
        let graphql_subscription = warp_graphql_subscription(graphql_schema);
        path("graphql")
            .and(path_end())
            .and(graphql_subscription.or(graphql))
    };

    // Build GraphQL playground filter
    let graphql_playground_filter = (get().or(head()))
        .map({
            let services = services.clone();
            move |_| services.clone()
        })
        .and_then(|services: Services| async move {
            let endpoint = {
                let mut endpoint = services.settings().api_public_url.clone();
                if !matches!(endpoint.scheme(), "http" | "https") {
                    let error = ErrorRejection::new(
                        "invalid GraphQL playground endpoint scheme",
                    );
                    return Err(rejection(error));
                }
                let path = endpoint.path();
                if !path.ends_with('/') {
                    let path = path.to_owned() + "/";
                    endpoint.set_path(&path);
                }
                endpoint.join("graphql").unwrap()
            };

            let subscription_endpoint = {
                let mut endpoint = endpoint.clone();
                let scheme = match endpoint.scheme() {
                    "http" => "ws",
                    "https" => "wss",
                    _ => {
                        panic!("invalid GraphQL playground endpoint scheme")
                    }
                };
                endpoint.set_scheme(scheme).unwrap();
                endpoint
            };

            let config = GraphQLPlaygroundConfig::new(endpoint.as_str())
                .subscription_endpoint(subscription_endpoint.as_str());
            let source = graphql_playground_source(config);
            Ok(source)
        })
        .map(|source: String| {
            Response::builder()
                .header(CONTENT_TYPE, "text/html")
                .body(source)
        });

    // Build root filter
    let filter = (path_end().and(graphql_playground_filter))
        .or(graphql_filter)
        .with({
            let cors =
                cors().allow_method(Method::POST).allow_header(CONTENT_TYPE);
            let cors = match env_var("JUSTCHAT_API_CORS_ALLOW_ORIGIN") {
                Ok(origin) => {
                    if origin == "*" {
                        cors.allow_any_origin()
                    } else {
                        cors.allow_origins(origin.split(','))
                    }
                }
                Err(EnvVarError::NotPresent) => cors,
                Err(error) => {
                    return Err(error).context(
                        "invalid environment variable \
                        JUSTCHAT_API_CORS_ALLOW_ORIGIN",
                    )
                }
            };
            cors
        })
        .recover(recover);

    let host = env_var_or("JUSTCHAT_API_HOST", "0.0.0.0")
        .context("failed to get environment variable JUSTCHAT_API_HOST")?;
    let port = env_var_or("JUSTCHAT_API_PORT", "3000")
        .context("failed to get environment variable JUSTCHAT_API_PORT")?;
    let addr: SocketAddr = format!("{}:{}", host, port)
        .parse()
        .context("failed to parse server address")?;

    info!(target: "justchat-api", "listening on http://{}", &addr);
    serve(filter).run(addr).await;
    Ok(())
}

async fn recover(rejection: Rejection) -> Result<impl Reply, Infallible> {
    let (error, status_code) = if rejection.is_not_found() {
        let error = ErrorRejection::new("not found");
        (error, StatusCode::NOT_FOUND)
    } else if let Some(error) = rejection.find::<ErrorRejection>() {
        let error = error.to_owned();
        (error, StatusCode::INTERNAL_SERVER_ERROR)
    } else if let Some(error) = rejection.find::<WarpGraphQLBadRequest>() {
        let WarpGraphQLBadRequest(error) = error;
        let error = ErrorRejection::new(error.to_string());
        (error, StatusCode::BAD_REQUEST)
    } else if let Some(error) = rejection.find::<Error>() {
        let error = ErrorRejection::from(error);
        (error, StatusCode::INTERNAL_SERVER_ERROR)
    } else {
        error!(target: "justchat-api", "unhandled rejection: {:?}", &rejection);
        let error = ErrorRejection::new("internal server error");
        (error, StatusCode::INTERNAL_SERVER_ERROR)
    };

    let reply = ErrorReply {
        errors: vec![error],
        status_code: status_code.as_u16(),
    };
    let reply = reply_json(&reply);
    let reply = reply_with_status(reply, status_code);
    Ok::<_, Infallible>(reply)
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
struct ErrorReply {
    errors: Vec<ErrorRejection>,
    status_code: u16,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
struct ErrorRejection {
    message: Cow<'static, str>,
}

impl ErrorRejection {
    pub fn new(msg: impl Into<Cow<'static, str>>) -> Self {
        ErrorRejection {
            message: msg.into(),
        }
    }
}

impl Reject for ErrorRejection {}

impl From<&Error> for ErrorRejection {
    fn from(error: &Error) -> Self {
        let msg = format!("{:#}", error);
        Self::new(msg)
    }
}

impl From<Error> for ErrorRejection {
    fn from(error: Error) -> Self {
        Self::from(&error)
    }
}

fn trace_graphql_response(response: &GraphQLResponse) {
    response
        .errors
        .iter()
        .for_each(|error| match error.message.as_str() {
            "PersistedQueryNotFound" => (),
            _ => {
                let GraphQLError {
                    message,
                    locations,
                    path,
                    ..
                } = error;
                let locations = {
                    let locations = locations
                        .into_iter()
                        .map(ToString::to_string)
                        .collect::<Vec<_>>();
                    to_json_string(&locations).unwrap()
                };
                let path = to_json_string(path).unwrap();
                error!(
                    target: "justchat-api::graphql",
                    %locations,
                    %path,
                    "{}", message,
                );
            }
        })
}
