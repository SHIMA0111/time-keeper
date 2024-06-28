pub mod update_refresh_token;
pub mod update_login_footprint;
pub mod update_user;
pub mod update_table_setting;

use log::{debug, error};
use tokio_postgres::{Client, Transaction};
use tokio_postgres::types::ToSql;
use crate::errors::TimeKeeperError::DBCURDException;
use crate::errors::TimeKeeperResult;
use crate::sql::get_statement;

async fn update(stmt_str: &str, params: &[&(dyn ToSql + Sync)], client: &Client) -> TimeKeeperResult<u64> {
    let stmt = get_statement(stmt_str, client).await?;

    match client.execute(&stmt, params).await {
        Ok(update_number) => {
            debug!("Update record number is {}", update_number);
            Ok(update_number)
        }
        Err(e) => Err(DBCURDException(format!("{:?}", e))),
    }
}

async fn transaction_update(stmt_str: &str,
                            params: &[&(dyn ToSql + Sync)],
                            transaction: &Transaction<'_>) -> TimeKeeperResult<u64> {
    let stmt = match transaction.prepare(&stmt_str).await {
        Ok(stmt) => stmt,
        Err(e) => {
            error!("Statement generation failed due to {:?}", e);
            return Err(DBCURDException("statement generation failed".to_string()));
        }
    };

    match transaction.execute(&stmt, params).await {
        Ok(update_number) => {
            debug!("Update record number is {}", update_number);
            Ok(update_number)
        },
        Err(e) => Err(DBCURDException(format!("{:?}", e))),
    }
}