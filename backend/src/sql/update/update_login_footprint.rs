use chrono::Utc;
use log::{error, warn};
use uuid::Uuid;
use crate::db::DBConnection;
use crate::errors::TimeKeeperError::DBCURDException;
use crate::errors::TimeKeeperResult;
use crate::sql::SCHEMA_NAME;
use crate::sql::update::update;

pub async fn login_footprint(user_id: Uuid, conn: &DBConnection) -> TimeKeeperResult<()> {
    let statement_str = format!(
        "UPDATE {}.users SET last_login_timestamp=$1 WHERE id=$2",
        SCHEMA_NAME
    );
    let now = Utc::now().naive_utc();

    match update(&statement_str, &[&now, &user_id], conn.client()).await {
        Ok(res) => {
            if res == 1 {
                Ok(())
            }
            else {
                warn!("Update {} records. Please note it isn't expected behavior", res);
                Ok(())
            }
        },
        Err(e) => {
            error!("Failed to update login footprint due to {}", e.to_string());
            Err(DBCURDException("Failed to update user record.".to_string()))
        }
    }
}
