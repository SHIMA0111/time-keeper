use uuid::Uuid;
use crate::db::DBConnection;
use crate::errors::TimeKeeperResult;
use crate::sql::get::get_category::{get_specified_category};
use crate::sql::get::get_category_setting::get_validate_category_setting;
use crate::sql::insert::create_category::create_category;
use crate::types::db::category::{Category, CategoryContents, CreateCategory};

pub async fn get_category_service(user_id: Uuid, conn: &DBConnection) -> TimeKeeperResult<Vec<Category>> {
    let valid_tables = get_validate_category_setting(user_id, conn).await?;

    let categories =
        get_specified_category(user_id, &valid_tables, conn).await?;
    Ok(categories)
}

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
