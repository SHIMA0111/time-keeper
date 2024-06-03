use chrono::Utc;
use log::{error, warn};
use tokio_postgres::Client;
use tokio_postgres::types::ToSql;
use uuid::Uuid;
use crate::data::connector::DBConnection;
use crate::utils::error::TimeKeeperError::{DBConnectionException, RegisterAuthenticationException};
use crate::utils::sql::SCHEMA_NAME;
use crate::utils::types::TimeKeeperResult;

async fn update(stmt_str: &str, params: &[&(dyn ToSql + Sync)], client: &Client) -> TimeKeeperResult<u64> {
    let stmt = match client.prepare(&stmt_str).await {
        Ok(statement) => statement,
        Err(e) => return Err(DBConnectionException(e.to_string())),
    };

    return match client.execute(&stmt, params).await {
        Ok(insert_number) => Ok(insert_number),
        Err(e) => {
            Err(RegisterAuthenticationException(
                format!("Failed to update the input information due to '{}'", e.to_string())
            ))
        }
    };
}

pub async fn login_footprint(user_id: &Uuid, conn: &DBConnection) -> TimeKeeperResult<()> {
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
            Err(DBConnectionException("Failed to update user record.".to_string()))
        }
    }
}

pub(crate) async fn update_category_name(table_name: &str,
                                         name_en: &str,
                                         name_ja: &str,
                                         conn: &DBConnection) -> TimeKeeperResult<()> {
    let statement_str = format!(
        "UPDATE {}.display_setting SET display_name_en=$1, display_name_ja=$2 WHERE table_name=$3",
        SCHEMA_NAME);

    match update(&statement_str, &[&name_en, &name_ja, &table_name], conn.client()).await {
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
            error!("Failed to update category alias name due to {}", e.to_string());
            Err(DBConnectionException("Failed to update category table name.".to_string()))
        }
    }
}
