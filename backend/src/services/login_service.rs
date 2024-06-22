use log::{error, info};
use uuid::Uuid;
use crate::db::DBConnection;
use crate::errors::TimeKeeperError::UserAuthenticationException;
use crate::errors::TimeKeeperResult;
use crate::sql::get::get_user::get_user;
use crate::sql::insert::create_refresh_token::register_refresh_token;
use crate::sql::update::update_login_footprint::login_footprint;
use crate::types::db::refresh_token::RefreshToken;
use crate::types::db::user::User;
use crate::types::token::Token;
use crate::utils::hash::{verify_password};
use crate::utils::token::generate_jwt_token;

pub async fn login_service(email: &str,
                           password: &str,
                           conn: &DBConnection) -> TimeKeeperResult<(Token, Token, User)> {
    let user_row = get_user(email, conn).await?;

    let user_password = user_row.password();
    if let None = user_password {
        error!("Cannot get user password");
        return Err(UserAuthenticationException("input data cannot authenticated".to_string()));
    }

    let user_id = if verify_password(password, &user_password.unwrap()) {
        let user_id = user_row.user_id();
        login_footprint(user_id, conn).await?;
        user_id
    }
    else {
        info!("Invalid authentication. Input doesn't match the registered data.");
        return Err(UserAuthenticationException("input data cannot authenticated".to_string()));
    };

    let access_token = generate_jwt_token(user_id, false)?;
    let refresh_token = generate_jwt_token(user_id, true)?;

    let refresh_token_detail = RefreshToken::from_token(&refresh_token, user_id);
    register_refresh_token(&refresh_token_detail, conn).await?;

    let user_data_without_password = user_row.remove_password_info();

    Ok((access_token, refresh_token, user_data_without_password))
}