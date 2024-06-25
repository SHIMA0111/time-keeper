use uuid::Uuid;
use crate::db::DBConnection;
use crate::errors::TimeKeeperResult;
use crate::sql::get::get_category::get_all_category;
use crate::types::db::category::Category;

pub async fn get_all_category_setting_service(user_id: Uuid,
                                              conn: &DBConnection) -> TimeKeeperResult<Vec<Category>> {
    get_all_category(user_id, conn).await
}