use serde::{Deserialize, Serialize};
use crate::utils::error::TimeKeeperError::InvalidSettingException;
use crate::utils::types::TimeKeeperResult;

#[derive(Serialize, Deserialize, Debug)]
pub struct CategoryResponse {
    top: CategoryName,
    sub1: Option<CategoryName>,
    sub2: Option<CategoryName>,
    sub3: Option<CategoryName>,
    sub4: Option<CategoryName>,
    contents_num: i32,
}

impl CategoryResponse {
    pub fn new(data: &[CategoryName]) -> TimeKeeperResult<Self> {
        if data.len() > 5 {
            return Err(InvalidSettingException("The table should be up to 5".to_string()));
        }
        let top = match data.get(0) {
            Some(top) => top.clone(),
            None => {
                return Err(InvalidSettingException("top table doesn't exist".to_string()));
            }
        };
        let sub1 = data.get(1).cloned();
        let sub2 = data.get(2).cloned();
        let sub3 = data.get(3).cloned();
        let sub4 = data.get(4).cloned();
        let contents_num = data.len() as i32;

        Ok(Self { top, sub1, sub2, sub3, sub4, contents_num })
    }
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct CategoryName {
    table_name: String,
    display_name: String,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct CategoryInformation {
    category: CategoryName,
    superior_table: Option<String>,
}

impl CategoryInformation {
    pub fn new(table_name: String, display_name: String, superior_table: Option<String>) -> Self {
        Self {
            category: CategoryName {
                table_name,
                display_name,
            },
            superior_table,
        }
    }

    pub fn get_category_name(&self) -> CategoryName {
        self.category.clone()
    }

    pub fn get_table_name(&self) -> String {
        self.category.table_name.clone()
    }

    pub fn superior_table(&self) -> Option<String> {
        self.superior_table.clone()
    }
}
