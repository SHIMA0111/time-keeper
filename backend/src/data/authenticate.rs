use log::{error, info};
use crate::data::connector::DBConnection;
use crate::utils::password::verify_password;
use crate::utils::types::PGResult;

pub(crate) async fn authentication(email: &str,
                                   password: &str,
                                   connection: &DBConnection) -> PGResult<String> {
    let user_row = connection.client()
        .query(
            "SELECT id, password FROM time_schema.users WHERE email=$1",
            &[&email]).await?;

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