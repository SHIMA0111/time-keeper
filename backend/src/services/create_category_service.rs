use uuid::Uuid;
use crate::db::DBConnection;
use crate::errors::TimeKeeperResult;
use crate::sql::insert::create_category::create_category;
use crate::types::api::create_category::CreateCategoryInput;
use crate::types::db::category::{CategoryContents, CreateCategory};

pub async fn create_category_service(user_id: Uuid,
                                     table_name: String,
                                     category_name: String,
                                     superior_id: Option<Uuid>,
                                     conn: &DBConnection) -> TimeKeeperResult<CategoryContents> {
    let create_category_data = CreateCategory::new(
        table_name,
        category_name,
        superior_id,
        user_id,
    );
    create_category(&create_category_data, conn).await?;
    let created_category_contents = create_category_data.category_contents();

    Ok(created_category_contents)
}