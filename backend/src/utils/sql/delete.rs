use crate::data::connector::DBConnection;
use crate::utils::error::AuthenticateError::DBConnectionException;
use crate::utils::sql::SCHEMA_NAME;
use crate::utils::types::AuthenticateResult;

pub(crate) async fn delete_refresh_token(user_id: &str, conn: &DBConnection) -> AuthenticateResult<u64> {
    let statement_str = format!("DELETE FROM {}.refresh_token WHERE uid=$1", SCHEMA_NAME);

    let stmt = match conn.client().prepare(&statement_str).await {
        Ok(statement) => statement,
        Err(e) => {
            return Err(DBConnectionException(e.to_string()));
        }
    };

    match conn.client().execute(&stmt, &[&user_id]).await {
        Ok(delete_number) => Ok(delete_number),
        Err(e) => {
            Err(DBConnectionException(format!("Failed to delete the refresh token by [{}]", e.to_string())))
        }
    }
}
