use tokio_stream::wrappers::BroadcastStream;

use super::*;

use services::chatroom::MessageEvent;

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

    async fn sender(&self) -> &str {
        &self.record.sender.as_str()
    }

    async fn body(&self) -> &str {
        &self.record.body
    }
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Enum)]
#[graphql(name = "MessageEventType")]
pub(super) enum MessageEventTypeEnum {
    Start,
    End,
    Append,
    Delete,
}

#[derive(Debug, Clone, SimpleObject)]
#[graphql(name = "MessageStartEvent")]
pub(super) struct MessageStartEventObject {
    pub sender: String,
    pub ch: char,
}

#[derive(Debug, Clone, SimpleObject)]
#[graphql(name = "MessageAppendEvent")]
pub(super) struct MessageAppendEventObject {
    pub ch: char,
}

#[derive(Debug, Clone, Default, SimpleObject)]
#[graphql(name = "MessageEvent")]
pub(super) struct MessageEventObject {
    pub start: Option<MessageStartEventObject>,
    pub end: bool,
    pub append: Option<MessageAppendEventObject>,
    pub delete: bool,
}

impl From<MessageEvent> for MessageEventObject {
    fn from(event: MessageEvent) -> Self {
        use MessageEvent::*;
        match event {
            Start { sender, ch } => MessageEventObject {
                start: Some(MessageStartEventObject {
                    sender: sender.to_string(),
                    ch,
                }),
                ..default()
            },
            End => MessageEventObject {
                end: true,
                ..default()
            },
            Append { ch } => MessageEventObject {
                append: Some(MessageAppendEventObject { ch }),
                ..default()
            },
            Delete => MessageEventObject {
                delete: true,
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
    ) -> impl Stream<Item = FieldResult<MessageEventObject>> {
        let services = ctx.services();
        let stream = {
            let rx = services.chatroom().subscribe();
            BroadcastStream::new(rx)
        };
        stream.map(move |result| {
            result.map(MessageEventObject::from).map_err(|error| {
                let message = error.to_string();
                FieldError::new(message)
            })
        })
    }
}

#[derive(Debug, Clone, Copy)]
pub(super) struct MessageMutation;

#[Object]
impl MessageMutation {
    async fn send_event(
        &self,
        ctx: &Context<'_>,
        input: SendEventInput,
    ) -> FieldResult<SendEventPayload> {
        let SendEventInput {
            start,
            end,
            append,
            delete,
        } = input;

        let event = {
            use MessageEvent::*;
            if let Some(MessageStartEventInput { sender, ch }) = start {
                let sender: Handle = sender
                    .parse()
                    .context("failed to parse sender handle")
                    .into_field_result()?;
                Start { sender, ch }
            } else if end.unwrap_or_default() {
                End
            } else if let Some(MessageAppendEventInput { ch }) = append {
                Append { ch }
            } else if delete.unwrap_or_default() {
                Delete
            } else {
                panic!("invalid event");
            }
        };

        let services = ctx.services();
        let ctx = EntityContext::new(services.clone());
        let chatroom = services.chatroom();

        let message = chatroom
            .send(&ctx, event.clone())
            .await
            .context("failed to send message")
            .into_field_result()?;

        let payload = SendEventPayload {
            ok: true,
            event: event.into(),
            message: message.map(Into::into),
        };
        Ok(payload)
    }
}

#[derive(Debug, Clone, InputObject)]
pub(super) struct SendEventInput {
    pub start: Option<MessageStartEventInput>,
    pub end: Option<bool>,
    pub append: Option<MessageAppendEventInput>,
    pub delete: Option<bool>,
}

#[derive(Debug, Clone, InputObject)]
pub(super) struct MessageStartEventInput {
    pub sender: String,
    pub ch: char,
}

#[derive(Debug, Clone, InputObject)]
pub(super) struct MessageAppendEventInput {
    pub ch: char,
}

#[derive(Debug, Clone, SimpleObject)]
pub(super) struct SendEventPayload {
    pub ok: bool,
    pub event: MessageEventObject,
    pub message: Option<MessageObject>,
}
