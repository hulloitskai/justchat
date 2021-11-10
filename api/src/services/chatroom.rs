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
    current_message_protect_duration: Duration,
    sx: BroadcastSender<Event>,
    rx: BroadcastReceiver<Event>,
}

impl Chatroom {
    pub fn new() -> Self {
        let (sx, rx) = broadcast_channel(256);
        Chatroom {
            current_message: default(),
            current_message_protect_duration: Duration::milliseconds(500),
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
    ) -> Result<UpdateInfo> {
        let Update { sender_handle, key } = update;
        let mut current_message = self.current_message.lock().await;

        // Maybe update current message
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

                let info = UpdateInfo {
                    ok: true,
                    current_message: current_message.clone(),
                };
                return Ok(info);
            } else {
                // Retain current message
                *current_message = Some(message.clone());

                // Disallow updates from other senders if current message is
                // protected.
                let protect_duration = self.current_message_protect_duration;
                let protect_until = message.created_at() + protect_duration;
                if now() < protect_until {
                    let info = UpdateInfo {
                        ok: false,
                        current_message: current_message.clone(),
                    };
                    return Ok(info);
                }
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
        let info = UpdateInfo {
            ok: true,
            current_message: current_message.clone(),
        };
        Ok(info)
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

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UpdateInfo {
    pub ok: bool,
    pub current_message: Option<Record<Message>>,
}
