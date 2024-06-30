use log::error;
use tokio_postgres::{Client, Statement, Transaction};
use crate::errors::TimeKeeperError::{DBCURDException};
use crate::errors::TimeKeeperResult;

pub mod insert;
pub mod get;
pub mod update;

const SCHEMA_NAME: &str = "time_schema";

async fn get_statement(stmt: &str, client: &Client) -> TimeKeeperResult<Statement> {
    match client.prepare(&stmt).await {
        Ok(statement) => Ok(statement),
        Err(e) => {
            error!("Statement generation failed due to {:?}", e);
            Err(DBCURDException("statement generation failed".to_string()))
        }
    }
}

async fn get_transaction_statement(stmt: &str, transaction: &Transaction<'_>) -> TimeKeeperResult<Statement> {
    match transaction.prepare(&stmt).await {
        Ok(statement) => Ok(statement),
        Err(e) => {
            error!("Statement generation failed due to {:?}", e);
            Err(DBCURDException("statement generation failed".to_string()))
        }
    }
}
