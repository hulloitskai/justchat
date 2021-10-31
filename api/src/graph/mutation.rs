use super::*;

#[derive(Debug, Clone, Copy, MergedObject)]
pub struct Mutation(TestMutation, MessageMutation);

impl Mutation {
    pub fn new() -> Self {
        Self(TestMutation, MessageMutation)
    }
}

impl Default for Mutation {
    fn default() -> Self {
        Self::new()
    }
}
