use tokio_postgres::{Client, Row};
use tokio_postgres::types::ToSql;
use crate::data::connector::DBConnection;
use crate::utils::error::AuthenticateError::{DBConnectionException, RegisterAuthenticationException};
use crate::utils::types::AuthenticateResult;

const SCHEMA_NAME: &str = "time_schema";

async fn execute_query(stmt_str: &str, params: &[&(dyn ToSql + Sync)], client: &Client) -> AuthenticateResult<Vec<Row>> {
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

pub(crate) async fn get_authentication_data(email: &str, conn: &DBConnection) -> AuthenticateResult<Vec<Row>> {
    let statement_str =
        format!("SELECT id, password, username FROM {}.users WHERE email=$1", SCHEMA_NAME);

    execute_query(&statement_str, &[&email], conn.client()).await
}

pub(crate) async fn get_refresh_info(refresh_token: &str, conn: &DBConnection) -> AuthenticateResult<Vec<Row>> {
    let statement_str = format!(
        "SELECT \
            refresh_info.uid, \
            refresh_info.exp, \
            refresh_info.is_invalid, \
            refresh_info.is_deleted, \
            users.username \
        FROM {}.refresh_token as refresh_info \
        INNER JOIN \
            {}.users as users \
        ON refresh_info.uid = users.id \
        WHERE token=$1", SCHEMA_NAME, SCHEMA_NAME);

    execute_query(&statement_str, &[&refresh_token], conn.client()).await
}

pub(crate) async fn insert_register(user_id: &str,
                                    username: &str,
                                    email: &str,
                                    password: &str,
                                    conn: &DBConnection) -> AuthenticateResult<u64> {
    let statement_str = format!(
        "INSERT INTO {}.users (id, username, email, password) VALUES ($1, $2, $3, $4)",
        SCHEMA_NAME);

    let stmt = match conn.client().prepare(&statement_str).await {
        Ok(statement) => statement,
        Err(e) => return Err(DBConnectionException(e.to_string())),
    };

    let res = match conn.client().execute(&stmt,
                                    &[&user_id, &username, &email, &password]).await {
        Ok(insert_number) => insert_number,
        Err(e) => {
            return Err(RegisterAuthenticationException(
                format!("Register the input authenticate information as new user({})", e.to_string())
            ))
        }
    };

    Ok(res)
}
