use log::error;
use tokio_postgres::{Client, Row};
use tokio_postgres::types::ToSql;
use crate::data::connector::DBConnection;
use crate::utils::error::TimeKeeperError::{DBConnectionException, InvalidSettingException};
use crate::utils::sql::{get_uuid, SCHEMA_NAME, uuid_from_string};
use crate::utils::types::TimeKeeperResult;

async fn execute_query(stmt_str: &str, params: &[&(dyn ToSql + Sync)], client: &Client) -> TimeKeeperResult<Vec<Row>> {
    let stmt = match client.prepare(&stmt_str).await {
        Ok(statement) => statement,
        Err(e) => {
            return Err(DBConnectionException(e.to_string()));
        }
    };

    match client.query(&stmt, params).await {
        Ok(res) => Ok(res),
        Err(e) => return Err(DBConnectionException(e.to_string())),
    }
}

async fn check_table_exist(table_name: &str, conn: &DBConnection) -> bool {
    let statement_str = format!("SELECT * FROM {}.category_setting WHERE table_name=$1", SCHEMA_NAME);
    match execute_query(&statement_str, &[&table_name], conn.client()).await {
        Ok(rows) => {
            match rows.len() {
                0 => false,
                _ => true,
            }
        },
        Err(e) => {
            error!("check table if it exist failed due to [{:?}]", e);
            false
        }
    }
}

pub(crate) async fn get_authentication_data(email: &str, conn: &DBConnection) -> TimeKeeperResult<Vec<Row>> {
    let statement_str =
        format!("SELECT id, password, username FROM {}.users WHERE email=$1", SCHEMA_NAME);

    execute_query(&statement_str, &[&email], conn.client()).await
}

pub(crate) async fn get_refresh_info(refresh_token: &str, conn: &DBConnection) -> TimeKeeperResult<Vec<Row>> {
    let statement_str = format!(
        "SELECT \
            refresh_info.uid, \
            refresh_info.exp, \
            refresh_info.is_invalid, \
            users.username \
        FROM {}.refresh_token as refresh_info \
        INNER JOIN \
            {}.users as users \
        ON \
            refresh_info.uid = users.id \
        WHERE \
            token=$1",
        SCHEMA_NAME, SCHEMA_NAME);

    execute_query(&statement_str, &[&refresh_token], conn.client()).await
}

pub(crate) async fn get_is_existing_refresh_token(user_id: &str, conn: &DBConnection) -> bool {
    let statement_str =
        format!("SELECT uid FROM {}.refresh_token WHERE uid=$1", SCHEMA_NAME);

    let uid = uuid_from_string(user_id);
    if let Err(e) = uid {
        error!("user_id cannot convert to UUID because {}", e.to_string());
        return true;
    }

    match execute_query(&statement_str, &[&(uid.unwrap())], conn.client()).await {
        Ok(count) => {
            if count.is_empty() {
                false
            }
            else {
                true
            }
        },
        Err(e) => {
            error!("Failed to request by {}.", e.to_string());
            true
        }
    }
}

pub(crate) async fn get_category_setting(conn: &DBConnection) -> TimeKeeperResult<Vec<Row>> {
    let statement_str =
        format!("SELECT * FROM {}.category_setting WHERE is_invalid=FALSE", SCHEMA_NAME);

    execute_query(&statement_str, &[], conn.client()).await
}

pub(crate) async fn get_categories(table_name: &str,
                                   superior_id: Option<i32>,
                                   conn: &DBConnection) -> TimeKeeperResult<Vec<Row>> {
    if !check_table_exist(table_name, conn).await {
        error!("table name '{}' doesn't exist. please check and if you believe anything not wrong, please contact the developer.", table_name);
        return Err(InvalidSettingException(format!("table '{}' doesn't exist.", table_name)));
    }

    match superior_id {
        Some(id) => {
            let stmt = format!(
                "SELECT * FROM {}.{} WHERE is_deleted=FALSE AND (superior_category_id=$1 OR superior_category_id IS NULL)",
                SCHEMA_NAME, table_name);
            execute_query(&stmt, &[&id], conn.client()).await
        },
        None => {
            let stmt = format!(
                "SELECT * FROM {}.{} WHERE is_deleted=FALSE", SCHEMA_NAME, table_name);
            execute_query(&stmt, &[], conn.client()).await
        }
    }
}

pub(crate) async fn get_category_alias(user_id: &str, conn: &DBConnection) -> TimeKeeperResult<Vec<Row>> {
    let statement_str = format!("\
    SELECT \
        alias_name \
    FROM \
        {}.category_alias \
    INNER JOIN
        {}.
    WHERE \
        created_user_id=$1", SCHEMA_NAME);
    let uid = get_uuid(user_id)?;

    execute_query(&statement_str, &[&uid], conn.client()).await
}
