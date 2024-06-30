use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct CategoryInput {
    id: String,
    table_name: String,
    new_category_name: String,
    superior_id: Option<String>,
}

impl CategoryInput {
    pub fn dummy_id(&self) -> String {
        self.id.clone()
    }

    pub fn table_name(&self) -> String {
        self.table_name.clone()
    }

    pub fn category_name(&self) -> String {
        self.new_category_name.clone()
    }

    pub fn superior_id(&self) -> Option<String> {
        self.superior_id.clone()
    }
}
