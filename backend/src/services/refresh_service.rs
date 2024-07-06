use chrono::Duration;
use log::warn;
use crate::db::DBConnection;
use crate::errors::TimeKeeperResult;
use crate::sql::get::get_refresh_token::get_refresh_token;
use crate::sql::update::update_refresh_token::update_refresh_token;
use crate::types::token::Token;
use crate::utils::token::{generate_jwt_token, get_now, refresh_token_verify};
use crate::utils::uuid::uuid_from_string;

pub async fn refresh_service(refresh_token: String, conn: &DBConnection) -> TimeKeeperResult<Token> {
    let refresh_token = get_refresh_token(&refresh_token, &conn).await?;
    let user_id = refresh_token_verify(&refresh_token).await?;
    let user_id = uuid_from_string(&user_id)?;

    let access_token = generate_jwt_token(user_id, false)?;
    let now = get_now()?;
    let new_exp = (now + Duration::hours(1)).timestamp();

    if let Err(e) = update_refresh_token(&refresh_token, new_exp, conn).await {
        warn!("refresh_token exp time extend process failed due to {:?} so the exp time is still old", e);
    };


    Ok(access_token)
}