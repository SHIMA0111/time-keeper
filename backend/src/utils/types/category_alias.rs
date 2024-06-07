use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug)]
pub struct CategoryAliasInput {
    alias_name: String,
    top_id: i32,
    sub1_id: Option<i32>,
    sub2_id: Option<i32>,
    sub3_id: Option<i32>,
    sub4_id: Option<i32>,
}

impl CategoryAliasInput {
    pub fn alias_name(&self) -> String {
        self.alias_name.to_string()
    }

    pub fn top_id(&self) -> i32 {
        self.top_id
    }

    pub fn sub1_id(&self) -> Option<i32> {
        self.sub1_id
    }

    pub fn sub2_id(&self) -> Option<i32> {
        self.sub2_id
    }

    pub fn sub3_id(&self) -> Option<i32> {
        self.sub3_id
    }

    pub fn sub4_id(&self) -> Option<i32> {
        self.sub4_id
    }
}
