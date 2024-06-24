use log::error;
use uuid::Uuid;
use crate::db::DBConnection;
use crate::errors::TimeKeeperError::DBCURDException;
use crate::errors::TimeKeeperResult;
use crate::sql::SCHEMA_NAME;
use crate::sql::update::update;

pub async fn update_user(user_id: Uuid,
                         username: &str,
                         email: &str,
                         conn: &DBConnection) -> TimeKeeperResult<()> {
    let statement_str = format!(
        "UPDATE {}.users SET username=$1, email=$2 WHERE id=$3", SCHEMA_NAME);
    let update_num =
        update(&statement_str, &[&username, &email, &user_id], conn.client()).await?;

    if update_num == 0 {
        error!("Failed to update user data");
        return Err(DBCURDException("user update number indicates 0".to_string()));
    };

    Ok(())
}