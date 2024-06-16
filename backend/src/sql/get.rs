pub mod get_user;
pub mod get_refresh_token;
pub mod get_category;
pub mod get_category_setting;

use tokio_postgres::{Client, Row};
use tokio_postgres::types::ToSql;
use crate::errors::TimeKeeperError::DBCURDException;
use crate::errors::TimeKeeperResult;
use crate::sql::{get_statement};

async fn get_all(stmt: &str, params: &[&(dyn ToSql + Sync)], client: &Client) -> TimeKeeperResult<Vec<Row>> {
    let stmt = get_statement(stmt, client).await?;

    match client.query(&stmt, params).await {
        Ok(res) => Ok(res),
        Err(e) => Err(DBCURDException(format!("{:?}",e))),
    }
}

async fn get_one(stmt: &str, params: &[&(dyn ToSql + Sync)], client: &Client) -> TimeKeeperResult<Row> {
    let stmt = get_statement(stmt, client).await?;

    match client.query_one(&stmt, params).await {
        Ok(res) => Ok(res),
        Err(e) => Err(DBCURDException(format!("{:?}", e))),
    }
}