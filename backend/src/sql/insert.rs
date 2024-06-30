pub mod create_user;
pub mod create_refresh_token;
pub mod create_category;

use log::{debug};
use tokio_postgres::{Client, Transaction};
use tokio_postgres::types::ToSql;
use crate::errors::TimeKeeperError::DBCURDException;
use crate::errors::TimeKeeperResult;
use crate::sql::{get_statement, get_transaction_statement};

async fn insert(stmt_str: &str, params: &[&(dyn ToSql + Sync)], client: &Client) -> TimeKeeperResult<u64> {
    let stmt = get_statement(stmt_str, client).await?;

    return match client.execute(&stmt, params).await {
        Ok(insert_number) => {
            debug!("Insert record number is {}", insert_number);
            Ok(insert_number)
        },
        Err(e) => Err(DBCURDException(format!("{:?}", e))),
    };
}

async fn transaction_insert(stmt_str: &str,
                            params: &[&(dyn ToSql + Sync)],
                            transaction: &Transaction<'_>) -> TimeKeeperResult<u64> {
    let stmt = get_transaction_statement(stmt_str, transaction).await?;

    return match transaction.execute(&stmt, params).await {
        Ok(insert_number) => {
            debug!("transaction insert record number is {}", insert_number);
            Ok(insert_number)
        },
        Err(e) => Err(DBCURDException(format!("{:?}", e))),
    }
}
