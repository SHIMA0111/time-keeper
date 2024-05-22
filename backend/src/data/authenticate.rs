use log::{error, info};
use uuid::Uuid;
use crate::data::connector::DBConnection;
use crate::utils::error::AuthenticateError::{DBConnectionException, RegisterAuthenticationException};
use crate::utils::password::{hash_password, verify_password};
use crate::utils::types::AuthenticateResult;

pub(crate) async fn authentication(email: &str,
                                   password: &str,
                                   connection: &DBConnection) -> AuthenticateResult<String> {
    let user_row = match connection.client()
        .query(
            "SELECT id, password FROM time_schema.users WHERE email=$1",
            &[&email]).await {
        Ok(res) => res,
        Err(e) => return Err(DBConnectionException(e.to_string())),
    };

    if user_row.len() != 1 {
        match user_row.len() {
            0 => {
                info!("Invalid authentication. This email hasn't be registered.");
            },
            _ => {
                error!("This email was registered multiple. Please contact system administrator.");
            }
        }
        return Ok("".to_string());
    }

    let user_data_row = &user_row[0];
    let user_password = user_data_row.get("password");

    if verify_password(password, user_password) {
        Ok(user_data_row.get("id"))
    }
    else {
        info!("Invalid authentication. Input doesn't match the registered data.");
        Ok("".to_string())
    }
}

pub async fn register(email: &str, password: &str, username: &str, connection: &DBConnection) -> AuthenticateResult<String> {
    let hashed_password = hash_password(password);

    let statement_str = "INSERT INTO time_schema.users (id, username, email, password) VALUES ($1, $2, $3, $4)";
    let stmt = match connection.client().prepare(statement_str).await {
        Ok(statement) => statement,
        Err(e) => return Err(DBConnectionException(e.to_string())),
    };

    let user_id = Uuid::new_v4().to_string();
    let res = connection.client().execute(
        &stmt, &[&user_id, &username, &email, &hashed_password]).await;

    if let Err(e) = res {
        return Err(RegisterAuthenticationException(
            format!("Register the input authenticate information as new user({})", e.to_string())
        ))
    };

    Ok(user_id)
}
