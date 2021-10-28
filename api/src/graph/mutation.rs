use super::*;

#[derive(Debug, Clone, Copy, MergedObject)]
pub struct Mutation(MessageMutation);

impl Mutation {
    pub fn new() -> Self {
        Self(MessageMutation)
    }
}

impl Default for Mutation {
    fn default() -> Self {
        Self::new()
    }
}
