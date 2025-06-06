use uuid::Uuid;
use crate::db::DBConnection;
use crate::errors::TimeKeeperResult;
use crate::sql::get::{get_one};
use crate::sql::SCHEMA_NAME;
use crate::types::db::user::User;

pub async fn get_user(email: &str, conn: &DBConnection) -> TimeKeeperResult<User> {
    let stmt =
        format!("SELECT id, username, password, created_timestamp FROM {}.users WHERE email=$1", SCHEMA_NAME);

    let response = get_one(&stmt, &[&email], conn.client()).await?;

    let user = User::new(
        response.get("id"),
        response.get("username"),
        email.to_string(),
        Some(response.get("password")),
        response.get("created_timestamp"),
    );

    Ok(user)
}

pub async fn get_user_by_id(user_id: Uuid, conn: &DBConnection) -> TimeKeeperResult<User> {
    let stmt =
        format!("SELECT username, email, password, created_timestamp FROM {}.users WHERE id=$1", SCHEMA_NAME);
    let response = get_one(&stmt, &[&user_id], conn.client()).await?;

    let user = User::new(
        user_id,
        response.get("username"),
        response.get("email"),
        Some(response.get("password")),
        response.get("created_timestamp"),
    );

    Ok(user)
}
