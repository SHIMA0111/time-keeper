use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Serialize, Deserialize, Debug)]
pub struct CreateCategoryInput {
    table_name: String,
    new_category_name: String,
    superior_id: Option<Uuid>,
}

impl CreateCategoryInput {
    pub fn table_name(&self) -> String {
        self.table_name.clone()
    }

    pub fn category_name(&self) -> String {
        self.new_category_name.clone()
    }

    pub fn superior_id(&self) -> Option<Uuid> {
        self.superior_id
    }
}
