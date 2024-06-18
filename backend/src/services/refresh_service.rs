use chrono::Duration;
use log::warn;
use crate::db::DBConnection;
use crate::errors::TimeKeeperResult;
use crate::sql::get::get_refresh_token::get_refresh_token;
use crate::sql::get::get_user::get_user_by_id;
use crate::sql::update::update_refresh_token::update_refresh_token;
use crate::types::token::Token;
use crate::utils::token::{generate_jwt_token, refresh_token_verify};
use crate::utils::uuid::uuid_from_string;

pub async fn refresh_service(refresh_token: String, conn: &DBConnection) -> TimeKeeperResult<(String, Token)> {
    let refresh_token = get_refresh_token(&refresh_token, &conn).await?;
    let user_id = refresh_token_verify(&refresh_token).await?;
    let user_id = uuid_from_string(&user_id)?;

    let user = get_user_by_id(user_id, conn).await?;
    let access_token = generate_jwt_token(user_id, false)?;

    let refresh_duration = Duration::hours(1);
    if let Err(e) = update_refresh_token(&refresh_token, refresh_duration, conn).await {
        warn!("refresh_token exp time extend process failed due to {:?} so the exp time is still old", e);
    };

    let username = user.username();

    Ok((username, access_token))
}