use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug)]
pub struct CategorySetting {
    table_name: String,
    display_name: String,
}

impl CategorySetting {
    pub fn new(table_name: String, display_name: String) -> Self {
        Self {
            table_name, display_name,
        }
    }

    pub fn table_name(&self) -> String {
        self.table_name.clone()
    }

    pub fn display_name(&self) -> String {
        self.display_name.clone()
    }
}
