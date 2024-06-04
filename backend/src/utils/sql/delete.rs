use log::{error, warn};
use tokio_postgres::Client;
use tokio_postgres::types::ToSql;
use crate::data::connector::DBConnection;
use crate::utils::error::TimeKeeperError::{DBConnectionException, InvalidSettingException};
use crate::utils::sql::{SCHEMA_NAME, uuid_from_string};
use crate::utils::types::TimeKeeperResult;

async fn delete(stmt_str: &str, params: &[&(dyn ToSql + Sync)], client: &Client) -> TimeKeeperResult<u64> {
    let stmt = match client.prepare(stmt_str).await {
        Ok(statement) => statement,
        Err(e) => {
            return Err(DBConnectionException(e.to_string()));
        }
    };

    match client.execute(&stmt, params).await {
        Ok(delete_number) => Ok(delete_number),
        Err(e) => {
            Err(DBConnectionException(format!("Failed to delete the refresh token by [{}]", e.to_string())))
        }
    }
}

pub(crate) async fn delete_refresh_token(user_id: &str, conn: &DBConnection) -> TimeKeeperResult<u64> {
    let statement_str = format!("DELETE FROM {}.refresh_token WHERE uid=$1", SCHEMA_NAME);

    let uid = uuid_from_string(user_id);
    if let Err(e) = uid {
        return Err(InvalidSettingException(e.to_string()));
    }

    let res = delete(&statement_str, &[&(uid.unwrap())], conn.client()).await?;
    if res == 0 {
        error!("DB doesn't have any refresh token for user_id='{}'", user_id);
        return Err(InvalidSettingException("Refresh token not found".to_string()))
    }
    else if res > 1 {
        warn!("'{}' token deleted. But the system now has 1 token for 1 user. This is something wrong.", res);
    }
    Ok(res)
}
