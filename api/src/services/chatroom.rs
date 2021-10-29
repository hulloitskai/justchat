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
    sx: BroadcastSender<Event>,
    rx: BroadcastReceiver<Event>,
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

    pub async fn update(
        &self,
        ctx: &Context,
        update: Update,
    ) -> Result<Option<Record<Message>>> {
        let Update { sender_handle, key } = update;
        let mut current_message = self.current_message.lock().await;

        // Update current message
        if let Some(mut message) = current_message.take() {
            if message.sender_handle == sender_handle {
                // Update current message based on key
                *current_message = match key.as_str() {
                    "Backspace" => {
                        message.body.pop();
                        Some(message)
                    }
                    "Enter" => {
                        message
                            .save(ctx)
                            .await
                            .context("failed to save message")?;
                        None
                    }
                    ch if ch.len() == 1 => {
                        message.body.push_str(ch);
                        Some(message)
                    }
                    _ => bail!("invalid key"),
                };

                // Broadcast key
                let event = Event::Key(key);
                self.sx.send(event).context("failed to broadcast event")?;

                return Ok(current_message.clone());
            } else {
                *current_message = Some(message);
            }
        }

        // Start new message
        *current_message = match key.as_str() {
            "Backspace" | "Enter" => current_message.take(),
            ch if ch.len() == 1 => {
                // Save previous message
                if let Some(mut message) = current_message.take() {
                    message
                        .save(ctx)
                        .await
                        .context("failed to save message")?;
                }

                // Create new message
                let message = Record::new({
                    Message::builder()
                        .sender_handle(sender_handle)
                        .body(key)
                        .build()
                });

                // Broadcast message
                let event = Event::Message(message.clone());
                self.sx.send(event).context("failed to broadcast event")?;

                Some(message)
            }
            _ => bail!("invalid key"),
        };
        Ok(current_message.clone())
    }

    pub fn subscribe(&self) -> BroadcastReceiver<Event> {
        self.sx.subscribe()
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum Event {
    Message(Record<Message>),
    Key(String),
}

#[derive(Debug, Clone, Serialize, Deserialize, Builder)]
pub struct Update {
    pub sender_handle: Handle,
    pub key: String,
}
