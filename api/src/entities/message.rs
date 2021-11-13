use super::*;

pub type MessageId = EntityId<Message>;

lazy_static! {
    static ref MESSAGE_EXPIRES_IN: Duration = Duration::seconds(12);
}

#[derive(Debug, Clone, Serialize, Deserialize, Builder, Object)]
pub struct Message {
    pub sender_handle: Handle,
    pub body: String,
}

impl Message {
    pub fn expires_at(record: &Record<Message>) -> DateTime {
        record.updated_at() + *MESSAGE_EXPIRES_IN
    }

    pub fn is_expired(record: &Record<Message>) -> bool {
        Self::expires_at(record) > now()
    }
}

impl Entity for Message {
    const NAME: &'static str = "Message";

    type Services = Services;
    type Conditions = MessageConditions;
    type Sorting = MessageSorting;
}

#[derive(Debug, Clone, Serialize, Deserialize, Builder)]
pub struct MessageConditions {
    #[builder(setter(into))]
    pub is_expired: Option<bool>,
}

impl EntityConditions for MessageConditions {
    fn into_document(self) -> Document {
        let MessageConditions { is_expired } = self;

        let mut doc = Document::new();
        if let Some(is_expired) = is_expired {
            let expiry = now() - *MESSAGE_EXPIRES_IN;
            let condition = if is_expired {
                doc! { "$lt": expiry }
            } else {
                doc! { "$gte": expiry }
            };
            doc.insert("_updatedAt", condition);
        }

        doc
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum MessageSorting {
    CreatedAt(SortingDirection),
    UpdatedAt(SortingDirection),
}

impl EntitySorting for MessageSorting {
    fn into_document(self) -> Document {
        use MessageSorting::*;
        match self {
            CreatedAt(direction) => doc! { "_createdAt": direction },
            UpdatedAt(direction) => doc! { "_updatedAt": direction },
        }
    }
}
