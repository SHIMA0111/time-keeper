use uuid::Uuid;
use crate::db::DBConnection;
use crate::errors::TimeKeeperResult;
use crate::sql::get::get_user::get_user_by_id;
use crate::types::db::user::User;

pub async fn get_user_service(user_id: Uuid, conn: &DBConnection) -> TimeKeeperResult<User> {
    get_user_by_id(user_id, conn).await
}