use uuid::Uuid;
use crate::db::DBConnection;
use crate::errors::TimeKeeperResult;
use crate::sql::get::{get_all, get_one};
use crate::sql::SCHEMA_NAME;
use crate::types::db::refresh_token::RefreshToken;

pub async fn get_refresh_info(refresh_token: &str, conn: &DBConnection) -> TimeKeeperResult<RefreshToken> {
    let statement_str = format!(
        "SELECT * FROM {}.refresh_token WHERE token=$1",
        SCHEMA_NAME);

    let res = get_one(
        &statement_str, &[&refresh_token], conn.client()).await?;
    let refresh_token = RefreshToken::new(
        res.get("uid"),
        res.get("token"),
        res.get("iat"),
        res.get("exp"),
        res.get("is_valid"),
    );

    Ok(refresh_token)
}

pub async fn get_refresh_token_exist(user_id: Uuid, conn: &DBConnection) -> TimeKeeperResult<bool> {
    let statement_str =
        format!("SELECT uid FROM {}.refresh_token WHERE uid=$1 AND is_invalid=FALSE", SCHEMA_NAME);

    let res = get_all(&statement_str, &[&user_id], conn.client()).await?;

    if res.is_empty() {
        Ok(false)
    }
    else {
        Ok(true)
    }
}
