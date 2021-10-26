use super::*;

#[derive(Debug, Clone, Serialize, Deserialize, Builder, Object)]
pub struct Message {
    pub sender: Handle,
    pub body: String,
}

impl Entity for Message {
    const NAME: &'static str = "Message";

    type Services = Services;
    type Conditions = EmptyConditions;
    type Sorting = EmptySorting;
}

pub type MessageId = EntityId<Message>;
