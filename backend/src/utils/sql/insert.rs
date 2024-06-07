use log::{error, info};
use tokio_postgres::Client;
use tokio_postgres::types::ToSql;
use crate::data::connector::DBConnection;
use crate::utils::error::TimeKeeperError::{DBConnectionException, GenerationFailedException, InvalidSettingException, RegisterAuthenticationException};
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

pub(crate) async fn insert_alias(alias_name: &str,
                                 main_category: i32,
                                 sub_category1: Option<i32>,
                                 sub_category2: Option<i32>,
                                 sub_category3: Option<i32>,
                                 sub_category4: Option<i32>,
                                 user_id: &str,
                                 conn: &DBConnection) -> TimeKeeperResult<()> {
    let statement_str = format!(
        "INSERT INTO \
            {}.category_alias (alias_name, main_category_id, sub_category1_id, sub_category2_id, sub_category3_id, sub_category4_id, created_user_id)\
        VALUES \
            ($1, $2, $3, $4, $5, $6, $7)",
        SCHEMA_NAME
    );
    let uid = get_uuid(user_id)?;

    return match insert(&statement_str,
                        &[
                            &alias_name,
                            &main_category,
                            &sub_category1,
                            &sub_category2,
                            &sub_category3,
                            &sub_category4,
                            &uid],
                        conn.client()).await {
        Ok(res) => {
            if res == 0 {
                error!("Insert data number is '0'. Something wrong.");
                Err(InvalidSettingException("Insertion response indicates 0 records inserted".to_string()))
            }
            else{
                Ok(())
            }
        },
        Err(e) => {
            error!("Alias insertion failed due to {:?}", e);
            Err(e)
        }
    }
}
