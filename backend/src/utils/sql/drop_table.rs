use log::{error, info, warn};
use crate::data::connector::DBConnection;
use crate::utils::error::TimeKeeperError::{DBConnectionException, InvalidSettingException};
use crate::utils::sql::SCHEMA_NAME;
use crate::utils::sql::update::toggle_category_setting_for_table;
use crate::utils::types::TimeKeeperResult;

pub(crate) async fn old_drop_table(table_name: &str, update_visibility: bool, conn: &DBConnection) -> TimeKeeperResult<()> {
    let statement_str = format!("DROP TABLE {}.{}", SCHEMA_NAME, table_name);

    let res = toggle_category_setting_for_table(table_name, true, conn).await;
    if res.is_ok() || !update_visibility  {
        match conn.client().execute(&statement_str, &[]).await {
            Ok(_) => {
                info!("Complete delete table named '{}'", table_name);
                Ok(())
            },
            Err(e) => {
                error!("Drop table process failed due to {}", e.to_string());
                Err(InvalidSettingException(format!("Failed to drop table of '{}'. Now it is in soft deleted.", table_name)))
            }
        }
    }
    else {
        Err(InvalidSettingException("Revoke drop process due to failed to update table visibility".to_string()))
    }
}

pub(crate) async fn drop_table(table_name: &str, conn: &mut DBConnection) -> TimeKeeperResult<()> {
    let transaction = conn.transaction().await?;

    let query_foreign_table_stmt = format!(
        "SELECT table_name FROM {}.category_setting WHERE superior_table=$1", SCHEMA_NAME);


    Ok(())
}