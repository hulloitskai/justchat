use super::*;

#[derive(Debug, Clone, Copy, MergedObject)]
pub struct Query(BuildQuery, MessageQuery);

impl Query {
    pub fn new() -> Self {
        Self(BuildQuery, MessageQuery)
    }
}

impl Default for Query {
    fn default() -> Self {
        Self::new()
    }
}
