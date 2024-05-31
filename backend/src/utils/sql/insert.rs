use tokio_postgres::Client;
use tokio_postgres::types::ToSql;
use crate::data::connector::DBConnection;
use crate::utils::error::AuthenticateError::{DBConnectionException, RegisterAuthenticationException};
use crate::utils::error::TokenGenerateError;
use crate::utils::sql::SCHEMA_NAME;
use crate::utils::types::{AuthenticateResult, TokenResult};

async fn insert(stmt_str: &str, params: &[&(dyn ToSql + Sync)], client: &Client) -> AuthenticateResult<u64> {
    let stmt = match client.prepare(&stmt_str).await {
        Ok(statement) => statement,
        Err(e) => return Err(DBConnectionException(e.to_string())),
    };

    return match client.execute(&stmt, params).await {
        Ok(insert_number) => Ok(insert_number),
        Err(e) => {
            Err(RegisterAuthenticationException(
                format!("Failed to register the input authenticate information as new user({})", e.to_string())
            ))
        }
    };
}

pub(crate) async fn insert_new_user(user_id: &str,
                                    username: &str,
                                    email: &str,
                                    password: &str,
                                    conn: &DBConnection) -> AuthenticateResult<u64> {
    let statement_str = format!(
        "INSERT INTO {}.users (id, username, email, password) VALUES ($1, $2, $3, $4)",
        SCHEMA_NAME);

    insert(&statement_str, &[&user_id, &username, &email, &password], conn.client()).await
}

pub(crate) async fn insert_refresh_token(user_id: &str,
                                         token: &str,
                                         exp: i64,
                                         iat: i64,
                                         conn: &DBConnection) -> TokenResult<u64> {
    let statement_str = format!(
        "INSERT INTO {}.refresh_token (uid, token, exp, iat) VALUES ($1, $2, $3, $4)",
        SCHEMA_NAME);

    return match insert(&statement_str, &[&user_id, &token, &exp, &iat], conn.client()).await {
        Ok(res) => Ok(res),
        Err(e) => {
            Err(TokenGenerateError::GenerationFailedException(
                format!(
                    "token generation failed due to failed to resister the token: ({})", e.to_string()
                )
            ))
        }
    }
}
