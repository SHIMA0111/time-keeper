use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug)]
pub struct TableSetting {
    table_name: String,
    display_name: String,
    is_invalid: bool,
}

impl TableSetting {
    pub fn new(table_name: String, display_name: String, is_invalid: bool) -> Self {
        Self {
            table_name, display_name, is_invalid
        }
    }

    pub fn table_name(&self) -> String {
        self.table_name.clone()
    }

    pub fn display_name(&self) -> String {
        self.display_name.clone()
    }

    pub fn is_invalid(&self) -> bool {
        self.is_invalid
    }
}
