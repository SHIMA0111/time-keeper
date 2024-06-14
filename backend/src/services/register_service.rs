use uuid::Uuid;
use crate::db::DBConnection;
use crate::errors::TimeKeeperError::PasswordHashException;
use crate::errors::TimeKeeperResult;
use crate::sql::insert::create_user::create_user;
use crate::types::db::user::CreateUser;

pub async fn user_register(create_user_info: &CreateUser, connection: &DBConnection) -> TimeKeeperResult<Uuid> {
    if create_user_info.hash_password().is_empty() {
        return Err(PasswordHashException("hashed password is empty".to_string()));
    }
    let user_id = Uuid::new_v4();
    let username = create_user_info.username();
    let email = create_user_info.email();
    let hashed_password = create_user_info.hash_password();
    create_user(user_id, &username, &email, &hashed_password, connection).await?;

    Ok(user_id)
}