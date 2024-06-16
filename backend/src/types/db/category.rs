use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Serialize, Deserialize, Debug)]
pub struct Category {
    table_name: String,
    display_name: String,
    categories: Vec<CategoryContents>,
}

impl Category {
    pub fn new(table_name: String, display_name: String, categories: Vec<CategoryContents>) -> Self {
        Self {
            table_name,
            display_name,
            categories,
        }
    }
}

#[derive(Serialize, Deserialize, Debug)]
pub struct CategoryContents {
    id: Uuid,
    name: String,
    superior_id: Option<Uuid>,
}

impl CategoryContents {
    pub fn new(id: Uuid, name: String, superior_id: Option<Uuid>) -> Self {
        Self {
            id,
            name,
            superior_id,
        }
    }
}
