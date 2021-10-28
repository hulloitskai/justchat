use tokio::sync::broadcast::channel as broadcast_channel;
use tokio::sync::broadcast::Receiver as BroadcastReceiver;
use tokio::sync::broadcast::Sender as BroadcastSender;

use entrust::EntityMeta;
use entrust::Record;

use super::*;

use entities::Context;
use entities::Handle;
use entities::Message;

/// TODO: Persist live message regularly.
#[derive(Debug)]
pub struct Chatroom {
    current_message: AsyncMutex<Option<Record<Message>>>,
    sx: BroadcastSender<MessageEvent>,
    rx: BroadcastReceiver<MessageEvent>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum MessageEvent {
    Start { sender: Handle, ch: char },
    End,
    Append { ch: char },
    Delete,
}

impl Chatroom {
    pub fn new() -> Self {
        let (sx, rx) = broadcast_channel(256);
        Chatroom {
            current_message: default(),
            sx,
            rx,
        }
    }
}

impl Default for Chatroom {
    fn default() -> Self {
        Self::new()
    }
}

impl Chatroom {
    pub async fn current_message(&self) -> Option<Record<Message>> {
        self.current_message.lock().await.clone()
    }

    pub async fn send(
        &self,
        ctx: &Context,
        event: MessageEvent,
    ) -> Result<Option<Record<Message>>> {
        let mut current_message = self.current_message.lock().await;

        use MessageEvent::*;
        match event.clone() {
            Start { sender, ch } => {
                // Flush prev message
                if let Some(mut message) = current_message.take() {
                    message
                        .save(ctx)
                        .await
                        .context("failed to save message")?;
                }

                // Set new message
                let message = Message::builder()
                    .sender(sender)
                    .body(ch.to_string())
                    .build();
                let message = Record::new(message);
                *current_message = Some(message)
            }
            End => {
                // Flush prev message
                if let Some(mut message) = current_message.take() {
                    message
                        .save(ctx)
                        .await
                        .context("failed to save message")?;
                }

                // Clear message
                *current_message = None
            }
            Append { ch } => {
                // Append to message
                let message = match current_message.as_mut() {
                    Some(message) => message,
                    None => bail!("missing current message"),
                };
                message.body.push(ch);
            }
            Delete => {
                // Delete last char from message
                let message = match current_message.as_mut() {
                    Some(message) => message,
                    None => bail!("missing current message"),
                };
                message.body.pop();
            }
        }

        self.sx.send(event).context("failed to broadcast event")?;
        Ok(current_message.clone())
    }

    pub fn subscribe(&self) -> BroadcastReceiver<MessageEvent> {
        self.sx.subscribe()
    }
}
