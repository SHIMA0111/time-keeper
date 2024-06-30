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

#[derive(Serialize, Deserialize, Debug, Clone)]
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

    fn create_category(name: String, superior_id: Option<Uuid>) -> Self {
        let new_id = Uuid::new_v4();

        Self {
            id: new_id,
            name,
            superior_id,
        }
    }
}

#[derive(Debug)]
pub struct CreateCategory {
    table_name: String,
    category: CategoryContents,
    created_user_id: Uuid,
}

impl CreateCategory {
    pub fn new(table_name: String,
               category_name: String,
               category_superior_id: Option<Uuid>,
               created_user_id: Uuid) -> Self {
        let category = CategoryContents::create_category(category_name, category_superior_id);

        Self {
            table_name,
            category,
            created_user_id,
        }
    }

    pub fn table_name(&self) -> String {
        self.table_name.clone()
    }

    pub fn id(&self) -> Uuid {
        self.category.id
    }

    pub fn name(&self) -> String {
        self.category.name.clone()
    }

    pub fn superior_id(&self) -> Option<Uuid> {
        self.category.superior_id
    }

    pub fn created_user_id(&self) -> Uuid {
        self.created_user_id
    }
}
