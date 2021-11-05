use tokio_stream::once as stream_once;
use tokio_stream::wrappers::BroadcastStream;

use super::*;

use services::chatroom::Event as ChatroomEvent;
use services::chatroom::Update as ChatroomUpdate;
use services::chatroom::UpdateInfo as ChatroomUpdateInfo;

#[derive(Debug, Clone, From)]
pub(super) struct MessageObject {
    pub record: Record<Message>,
}

#[Object(name = "Message")]
impl MessageObject {
    async fn id(&self) -> Id<Message> {
        self.record.id().into()
    }

    async fn timestamp(&self) -> DateTimeScalar {
        self.record.created_at().into()
    }

    async fn sender_handle(&self) -> &str {
        &self.record.sender_handle.as_str()
    }

    async fn body(&self) -> &str {
        &self.record.body
    }
}

#[derive(Debug, Clone, Default, SimpleObject)]
#[graphql(name = "Event")]
pub(super) struct EventObject {
    pub message: Option<MessageObject>,
    pub key: Option<String>,
}

impl From<ChatroomEvent> for EventObject {
    fn from(event: ChatroomEvent) -> Self {
        use ChatroomEvent::*;
        match event {
            Message(message) => EventObject {
                message: Some(MessageObject::from(message)),
                ..default()
            },
            Key(key) => EventObject {
                key: Some(key),
                ..default()
            },
        }
    }
}

#[derive(Debug, Clone, Copy)]
pub(super) struct MessageQuery;

#[Object]
impl MessageQuery {
    async fn current_message(
        &self,
        ctx: &Context<'_>,
    ) -> Option<MessageObject> {
        let services = ctx.services();
        let message = services.chatroom().current_message().await;
        message.map(Into::into)
    }

    async fn message(
        &self,
        ctx: &Context<'_>,
        id: Id<Message>,
    ) -> FieldResult<Option<MessageObject>> {
        let services = ctx.services();
        let ctx = EntityContext::new(services);

        let message = Message::get(id.into())
            .optional()
            .load(&ctx)
            .await
            .context("failed to load message")
            .into_field_result()?;
        let message = message.map(MessageObject::from);
        Ok(message)
    }

    async fn messages(
        &self,
        ctx: &Context<'_>,
        skip: Option<u32>,
        take: Option<u32>,
    ) -> FieldResult<Vec<MessageObject>> {
        const TAKE_MAX: u32 = 25;

        let skip = skip.unwrap_or_default();
        let take = take.unwrap_or(TAKE_MAX);
        if take > TAKE_MAX {
            let error = FieldError::new("must take 25 or fewer messages");
            return Err(error);
        }

        let services = ctx.services();
        let ctx = EntityContext::new(services);

        let messages = Message::all()
            .sort(MessageSorting::Timestamp(SortingDirection::Desc))
            .take(take)
            .skip(skip)
            .load(&ctx)
            .await
            .context("failed to find messages")
            .into_field_result()?;
        let messages = messages
            .try_collect::<Vec<_>>()
            .await
            .context("failed to load messages")?;
        let messages = messages
            .into_iter()
            .map(MessageObject::from)
            .collect::<Vec<_>>();
        Ok(messages)
    }
}

#[derive(Debug, Clone, Copy)]
pub(super) struct MessageSubscription;

#[Subscription]
impl MessageSubscription {
    async fn event(
        &self,
        ctx: &Context<'_>,
    ) -> impl Stream<Item = FieldResult<EventObject>> {
        let services = ctx.services();
        let chatroom = services.chatroom();
        let initial = {
            let message = chatroom.current_message().await;
            let event = EventObject {
                message: message.map(Into::into),
                ..default()
            };
            stream_once(FieldResult::Ok(event))
        };
        let updates = {
            let rx = chatroom.subscribe();
            BroadcastStream::new(rx).map(move |result| {
                result.map(EventObject::from).map_err(|error| {
                    let message = error.to_string();
                    FieldError::new(message)
                })
            })
        };
        initial.chain(updates)
    }
}

#[derive(Debug, Clone, Copy)]
pub(super) struct MessageMutation;

#[Object]
impl MessageMutation {
    async fn update(
        &self,
        ctx: &Context<'_>,
        input: UpdateInput,
    ) -> FieldResult<UpdatePayload> {
        let UpdateInput { sender_handle, key } = input;
        let sender_handle: Handle = sender_handle
            .parse()
            .context("failed to parse sender handle")
            .into_field_result()?;

        let services = ctx.services();
        let chatroom = services.chatroom();
        let ctx = EntityContext::new(services.clone());

        let update = ChatroomUpdate::builder()
            .sender_handle(sender_handle)
            .key(key)
            .build();
        let update_info =
            chatroom.update(&ctx, update).await.into_field_result()?;

        let payload = {
            let ChatroomUpdateInfo {
                ok,
                current_message,
            } = update_info;
            UpdatePayload {
                ok,
                current_message: current_message.map(Into::into),
            }
        };
        Ok(payload)
    }
}

#[derive(Debug, Clone, InputObject)]
pub(super) struct UpdateInput {
    pub sender_handle: String,
    pub key: String,
}

#[derive(Debug, Clone, SimpleObject)]
pub(super) struct UpdatePayload {
    pub ok: bool,
    pub current_message: Option<MessageObject>,
}
