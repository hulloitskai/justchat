use super::*;

#[derive(Debug, Clone, Copy, MergedSubscription)]
pub struct Subscription(MessageSubscription);

impl Subscription {
    pub fn new() -> Self {
        Self(MessageSubscription)
    }
}

impl Default for Subscription {
    fn default() -> Self {
        Self::new()
    }
}
