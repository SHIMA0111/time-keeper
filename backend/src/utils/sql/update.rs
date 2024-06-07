use chrono::{Duration, Utc};
use log::{error, warn};
use tokio_postgres::Client;
use tokio_postgres::types::ToSql;
use uuid::Uuid;
use crate::data::connector::DBConnection;
use crate::utils::error::TimeKeeperError::{DBConnectionException, InvalidSettingException, RegisterAuthenticationException};
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
                                         display_name: &str,
                                         conn: &DBConnection) -> TimeKeeperResult<()> {
    let statement_str = format!(
        "UPDATE {}.category_setting SET display_name=$1 WHERE table_name=$3",
        SCHEMA_NAME);

    match update(&statement_str, &[&display_name, &table_name], conn.client()).await {
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

pub(crate) async fn toggle_category_setting_for_table(table_name: &str,
                                                      to_disabled: bool,
                                                      conn: &DBConnection) -> TimeKeeperResult<()> {
    let statement_str = format!(
        "UPDATE {}.category_setting SET is_invalid=$1 WHERE table_name=$2", SCHEMA_NAME);

    match update(&statement_str, &[&to_disabled, &table_name], conn.client()).await {
        Ok(res) => {
            if res == 1 {
                Ok(())
            }
            else if res > 1 {
                warn!("Update {} records. Please note it isn't expected behavior", res);
                Ok(())
            }
            else {
                error!("Update process failed. Please check the setting is correct.");
                Err(InvalidSettingException("Failed to update the table visibility".to_string()))
            }
        },
        Err(e) => {
            error!("Update failed due to {}", e.to_string());
            Err(e)
        }
    }
}

pub(crate) async fn update_refresh_token_exp(refresh_token: &str, conn: &DBConnection) -> TimeKeeperResult<()> {
    let statement_str = format!("UPDATE {}.refresh_token SET exp=$1 WHERE token=$2", SCHEMA_NAME);

    let now = Utc::now();
    if now.timestamp() <= 0 {
        error!("timestamp result is invalid. system detect '{}' but epoch time should be positive.", now.timestamp());
        return Err(InvalidSettingException("Timestamp is negative. This is invalid setting.".to_string()));
    }

    let after_1_hour = (now + Duration::hours(1)).timestamp();

    if let Err(e) = update(&statement_str, &[&after_1_hour, &refresh_token], conn.client()).await {
        error!("Update refresh_token's exp failed due to [{:?}]", e);
        return Err(DBConnectionException("Update refresh_token failed".to_string()));
    }
    Ok(())
}
