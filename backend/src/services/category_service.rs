use uuid::Uuid;
use crate::db::DBConnection;
use crate::errors::TimeKeeperResult;
use crate::sql::get::get_category::{get_all_category, get_specified_category};
use crate::sql::get::get_category_setting::get_validate_category_setting;
use crate::types::db::category::Category;

pub async fn category_info(user_id: Uuid, conn: &DBConnection) -> TimeKeeperResult<Vec<Category>> {
    let valid_tables = get_validate_category_setting(user_id, conn).await?;

    let categories =
        get_specified_category(user_id, &valid_tables, conn).await?;
    Ok(categories)
}