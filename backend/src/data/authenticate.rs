use log::{error, info, warn};
use uuid::Uuid;
use crate::data::connector::DBConnection;
use crate::utils::error::AuthenticateError;
use crate::utils::password::{hash_password, verify_password};
use crate::utils::sql::{get_authentication_data, get_refresh_info, insert_register};
use crate::utils::types::AuthenticateResult;

pub(crate) async fn authentication(email: &str,
                                   password: &str,
                                   connection: &DBConnection) -> AuthenticateResult<(String, String)> {
    let user_row = get_authentication_data(email, connection).await?;

    if user_row.len() != 1 {
        match user_row.len() {
            0 => {
                info!("Invalid authentication. This email hasn't be registered.");
            },
            _ => {
                error!("This email was registered multiple. Please contact system administrator.");
            }
        }
        return Ok(("".to_string(), "".to_string()));
    }

    let user_data_row = &user_row[0];
    let user_password = user_data_row.get("password");

    if verify_password(password, user_password) {
        Ok((user_data_row.get("id"), user_data_row.get("username")))
    }
    else {
        info!("Invalid authentication. Input doesn't match the registered data.");
        Ok(("".to_string(), "".to_string()))
    }
}

pub async fn register(email: &str, password: &str, username: &str, connection: &DBConnection) -> AuthenticateResult<String> {
    let hashed_password = hash_password(password);
    let user_id = Uuid::new_v4().to_string();
    insert_register(&user_id, username, email, &hashed_password, connection).await?;

    Ok(user_id)
}

pub async fn refresh_token_exp(refresh_token: &str, connection: &DBConnection) -> AuthenticateResult<(i64, String)> {
    let row = get_refresh_info(refresh_token, connection).await?;

    if row.len() != 1 {
        match row.len() {
            0 => error!("This token doesn't registered so cannot authenticated"),
            _ => error!("This token was registered multiply. Please check the process."),
        }
        return Err(AuthenticateError::RefreshTokenInvalidException(
            "This token is invalid by register error. Please contact the developer".to_string()
        ));
    }

    let row = &row[0];
    let uid = row.get::<_, String>("uid");
    info!("Found the token owner who is user_id = '{}'", uid);

    let is_invalid = row.get("is_invalid");
    let is_deleted = row.get("is_deleted");

    if is_invalid {
        warn!("This token is marked as 'Invalidate by user'.");
        return Err(AuthenticateError::RefreshTokenInvalidException(
            "This token was invalided by the token admin.".to_string()
        ));
    }
    else if is_deleted {
        warn!("This token is marked as 'Deleted by user'.");
        return Err(AuthenticateError::RefreshTokenInvalidException(
            "Not found this token.".to_string()
        ))
    }

    Ok((row.get::<_, i64>("exp"), row.get::<_, &str>("username").to_string()))
}
