use log::error;
use tokio_postgres::{Client, Statement};
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
