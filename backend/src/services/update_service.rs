use uuid::Uuid;
use crate::db::DBConnection;
use crate::errors::TimeKeeperResult;
use crate::sql::update::update_user::update_user;

pub async fn update_user_service(user_id: Uuid,
                                 username: &str,
                                 email: &str,
                                 conn: &DBConnection) -> TimeKeeperResult<()> {
    update_user(user_id, username, email, conn).await
}