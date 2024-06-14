use log::{error, info};
use crate::db::DBConnection;
use crate::errors::TimeKeeperError::DBCURDException;
use crate::errors::TimeKeeperResult;
use crate::sql::get::get_refresh_token::get_refresh_token_exist;
use crate::sql::insert::insert;
use crate::sql::SCHEMA_NAME;
use crate::sql::update::update_refresh_token::disable_refresh_token;
use crate::types::db::refresh_token::RefreshToken;

pub(crate) async fn register_refresh_token(refresh_token: &RefreshToken, conn: &DBConnection) -> TimeKeeperResult<()> {
    let user_id = refresh_token.user_id();
    if get_refresh_token_exist(user_id, conn).await? {
        info!("Existing old refresh_token so replace it to new.");
        disable_refresh_token(refresh_token, conn).await?;
    };

    let statement_str = format!(
        "INSERT INTO {}.refresh_token (uid, token, exp, iat) VALUES ($1, $2, $3, $4)",
        SCHEMA_NAME);

    let res =
        insert(&statement_str,
               &[&user_id,
                   &refresh_token.token(),
                   &refresh_token.exp(),
                   &refresh_token.iat()], conn.client()).await?;

    if res == 0 {
        error!("Failed to register refresh_token.");
        Err(DBCURDException("insert number indicates 0".to_string()))
    }
    else {
        Ok(())
    }
}
