pub mod update_refresh_token;
pub mod update_login_footprint;
pub mod update_user;

use log::{debug};
use tokio_postgres::Client;
use tokio_postgres::types::ToSql;
use crate::errors::TimeKeeperError::DBCURDException;
use crate::errors::TimeKeeperResult;
use crate::sql::get_statement;

async fn update(stmt_str: &str, params: &[&(dyn ToSql + Sync)], client: &Client) -> TimeKeeperResult<u64> {
    let stmt = get_statement(stmt_str, client).await?;

    return match client.execute(&stmt, params).await {
        Ok(insert_number) => {
            debug!("Update record number is {}", insert_number);
            Ok(insert_number)
        },
        Err(e) => Err(DBCURDException(format!("{:?}", e))),
    };
}