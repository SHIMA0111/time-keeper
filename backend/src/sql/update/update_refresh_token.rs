use chrono::{TimeDelta};
use log::error;
use crate::db::DBConnection;
use crate::errors::TimeKeeperError::{DBCURDException, RefreshTokenException};
use crate::errors::TimeKeeperResult;
use crate::sql::SCHEMA_NAME;
use crate::sql::update::update;
use crate::types::db::refresh_token::RefreshToken;

pub async fn update_refresh_token(refresh_token: &RefreshToken,
                                  exp_duration: TimeDelta,
                                  conn: &DBConnection) -> TimeKeeperResult<()> {
    let statement_str = format!(
        "UPDATE {}.refresh_token SET exp=$1 WHERE token=$2",
        SCHEMA_NAME,
    );
    let new_exp = refresh_token.exp() + exp_duration.num_seconds();

    match update(&statement_str, &[&new_exp, &refresh_token.token()], conn.client()).await {
        Ok(update_number) => {
            if update_number == 0 {
                error!("Failed to update refresh_token");
                Err(DBCURDException("refresh_token update number indicates 0".to_string()))
            }
            else {
                Ok(())
            }
        },
        Err(e) => Err(e)
    }
}

pub async fn disable_refresh_token(refresh_token: &RefreshToken,
                                   conn: &DBConnection) -> TimeKeeperResult<()> {
    let refresh_token_str = refresh_token.token();
    let uid = refresh_token.user_id();
    let statement_str = format!(
        "UPDATE {}.refresh_token SET is_invalid=TRUE WHERE token=$1 AND uid=$2",
        SCHEMA_NAME
    );

    let updated_num =
        update(&statement_str, &[&refresh_token_str, &uid], conn.client()).await?;

    if updated_num == 0 {
        error!("Failed to disable refresh token");
        return Err(RefreshTokenException("disable refresh token failed".to_string()));
    };
    Ok(())
}