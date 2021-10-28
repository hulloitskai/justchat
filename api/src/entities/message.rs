use super::*;

#[derive(Debug, Clone, Serialize, Deserialize, Builder, Object)]
pub struct Message {
    pub sender_handle: Handle,
    pub body: String,
}

impl Entity for Message {
    const NAME: &'static str = "Message";

    type Services = Services;
    type Conditions = EmptyConditions;
    type Sorting = MessageSorting;
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum MessageSorting {
    Timestamp(SortingDirection),
}

impl EntitySorting for MessageSorting {
    fn into_document(self) -> Document {
        use MessageSorting::*;
        match self {
            Timestamp(direction) => doc! { "_created_at": direction },
        }
    }
}

pub type MessageId = EntityId<Message>;
