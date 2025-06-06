use crate::db::DBConnection;
use crate::errors::TimeKeeperResult;
use crate::sql::get::get_refresh_token::get_refresh_token;
use crate::sql::update::update_refresh_token::disable_refresh_token;

pub async fn logout_service(refresh_token: &str, conn: &DBConnection) -> TimeKeeperResult<()> {
    let refresh_token_info = get_refresh_token(refresh_token, conn).await?;

    disable_refresh_token(&refresh_token_info, conn).await
}