use crate::data::connector::DBConnection;
use crate::utils::error::TimeKeeperError::{DBConnectionException, InvalidSettingException};
use crate::utils::sql::{SCHEMA_NAME, uuid_from_string};
use crate::utils::types::TimeKeeperResult;

pub(crate) async fn delete_refresh_token(user_id: &str, conn: &DBConnection) -> TimeKeeperResult<u64> {
    let statement_str = format!("DELETE FROM {}.refresh_token WHERE uid=$1", SCHEMA_NAME);

    let stmt = match conn.client().prepare(&statement_str).await {
        Ok(statement) => statement,
        Err(e) => {
            return Err(DBConnectionException(e.to_string()));
        }
    };

    let uid = uuid_from_string(user_id);
    if let Err(e) = uid {
        return Err(InvalidSettingException(e.to_string()));
    }

    match conn.client().execute(&stmt, &[&(uid.unwrap())]).await {
        Ok(delete_number) => Ok(delete_number),
        Err(e) => {
            Err(DBConnectionException(format!("Failed to delete the refresh token by [{}]", e.to_string())))
        }
    }
}
