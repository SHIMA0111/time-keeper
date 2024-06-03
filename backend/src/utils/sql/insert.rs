use log::{error, info, warn};
use tokio_postgres::Client;
use tokio_postgres::types::ToSql;
use crate::data::connector::DBConnection;
use crate::utils::error::TimeKeeperError::{
    DBConnectionException,
    GenerationFailedException,
    RegisterAuthenticationException};
use crate::utils::sql::delete::delete_refresh_token;
use crate::utils::sql::get::get_is_existing_refresh_token;
use crate::utils::sql::{get_uuid, SCHEMA_NAME};
use crate::utils::types::TimeKeeperResult;

async fn insert(stmt_str: &str, params: &[&(dyn ToSql + Sync)], client: &Client) -> TimeKeeperResult<u64> {
    let stmt = match client.prepare(&stmt_str).await {
        Ok(statement) => statement,
        Err(e) => return Err(DBConnectionException(e.to_string())),
    };

    return match client.execute(&stmt, params).await {
        Ok(insert_number) => Ok(insert_number),
        Err(e) => {
            Err(RegisterAuthenticationException(
                format!("Failed to register the new information due to {}", e.to_string())
            ))
        }
    };
}

pub(crate) async fn insert_new_user(user_id: &str,
                                    username: &str,
                                    email: &str,
                                    password: &str,
                                    conn: &DBConnection) -> TimeKeeperResult<u64> {
    let statement_str = format!(
        "INSERT INTO {}.users (id, username, email, password) VALUES ($1, $2, $3, $4)",
        SCHEMA_NAME);

    let uid = get_uuid(user_id)?;

    insert(&statement_str, &[&uid, &username, &email, &password], conn.client()).await
}

pub(crate) async fn insert_refresh_token(user_id: &str,
                                         token: &str,
                                         exp: i64,
                                         iat: i64,
                                         conn: &DBConnection) -> TimeKeeperResult<u64> {

    if get_is_existing_refresh_token(user_id, conn).await {
        info!("Existing old refresh_token so replace it to new.");
        if let Err(e) = delete_refresh_token(user_id, conn).await {
            error!("Failed to remove old refresh token due to {}", e.to_string());
            return Err(GenerationFailedException(e.to_string()));
        }
    };

    let statement_str = format!(
        "INSERT INTO {}.refresh_token (uid, token, exp, iat) VALUES ($1, $2, $3, $4)",
        SCHEMA_NAME);

    let uid = get_uuid(user_id)?;

    return match insert(&statement_str, &[&uid, &token, &exp, &iat], conn.client()).await {
        Ok(res) => Ok(res),
        Err(e) => {
            Err(GenerationFailedException(
                format!(
                    "token generation failed due to failed to resister the token: ({})", e.to_string()
                )
            ))
        }
    }
}

pub(crate) async fn insert_new_category(table_name: &str,
                                        name_en: &str,
                                        name_ja: &str,
                                        conn: &DBConnection) -> TimeKeeperResult<()> {
    let statement_str = format!(
        "INSERT INTO {}.display_setting (table_name, display_name_en, display_name_ja) VALUES ($1, $2, $3)",
        SCHEMA_NAME);

    return match insert(&statement_str, &[&table_name, &name_en, &name_ja], conn.client()).await {
        Ok(res) => {
            if res == 1 {
                Ok(())
            }
            else {
                warn!("Insert process of display_setting success but the update number is not expected.");
                Ok(())
            }
        },
        Err(e) => {
            Err(e)
        }
    }
}
