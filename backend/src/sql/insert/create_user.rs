use log::{error};
use uuid::Uuid;
use crate::db::DBConnection;
use crate::errors::TimeKeeperError::DBCURDException;
use crate::errors::TimeKeeperResult;
use crate::sql::insert::insert;
use crate::sql::SCHEMA_NAME;
use crate::types::db::user::CreateUser;

pub(crate) async fn create_user(user_id: Uuid,
                                create_user: &CreateUser,
                                conn: &DBConnection) -> TimeKeeperResult<()> {
    let statement_str = format!(
        "INSERT INTO {}.users (id, username, email, password) VALUES ($1, $2, $3, $4)",
        SCHEMA_NAME);

    let username = create_user.username();
    let email = create_user.email();
    let password = create_user.hash_password();

    match insert(&statement_str, &[&user_id, &username, &email, &password], conn.client()).await {
        Ok(insert_record_num) => {
            if insert_record_num == 0 {
                error!("Failed to create new user.");
                Err(DBCURDException("insert number indicates 0".to_string()))
            }
            else {
                Ok(())
            }
        },
        Err(e) => Err(e)
    }
}