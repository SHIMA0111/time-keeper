use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug)]
pub struct GetCategoryInput {
    table_name: String,
    superior_id: Option<i32>
}

impl GetCategoryInput {
    pub fn get_table_name(&self) -> String {
        self.table_name.clone()
    }

    pub fn get_superior_id(&self) -> Option<i32> {
        self.superior_id
    }
}

#[derive(Serialize, Deserialize, Debug)]
pub struct CategoryData {
    id: i32,
    name: String,
}

impl CategoryData {
    pub fn new(id: i32, name: String) -> Self {
        Self {
            id, name
        }
    }
}
