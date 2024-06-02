use chrono::Utc;
use log::{error, warn};
use uuid::Uuid;
use crate::data::connector::DBConnection;
use crate::utils::error::TimeKeeperError::{DBConnectionException, InvalidSettingException};
use crate::utils::sql::SCHEMA_NAME;
use crate::utils::types::TimeKeeperResult;

pub async fn login_footprint(user_id: &Uuid, conn: &DBConnection) -> TimeKeeperResult<()> {
    let statement_str = format!(
        "UPDATE {}.users SET last_login_timestamp=$1 WHERE id=$2",
        SCHEMA_NAME
    );
    let stmt = match conn.client().prepare(&statement_str).await {
        Ok(statement) => statement,
        Err(e) => {
            error!("Failed to prepare statement for login footprint due to {}", e.to_string());
            return Err(InvalidSettingException("statement generation failed.".to_string()));
        }
    };
    let now = Utc::now().naive_utc();
    match conn.client().execute(&stmt, &[&now, &user_id]).await {
        Ok(value) => {
            if value == 1 {
                Ok(())
            }
            else {
                warn!("Update {} records. Please note it isn't expected behavior", value);
                Ok(())
            }
        }
        Err(e) => {
            error!("Failed to update login footprint due to {}", e.to_string());
            Err(DBConnectionException("Failed to update user record.".to_string()))
        }
    }
}