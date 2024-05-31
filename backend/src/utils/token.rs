use std::env;
use chrono::{Duration, Utc};
use jsonwebtoken::{decode, DecodingKey, encode, EncodingKey, Header, Validation};
use log::{error, info, warn};
use crate::data::authenticate::refresh_token_exp;
use crate::data::connector::DBConnection;
use crate::utils::error::{AuthenticateError, TokenGenerateError};
use crate::utils::sql::insert::insert_refresh_token;
use crate::utils::types::{AuthenticateResult, TokenInfo, TokenResult};

pub async fn token_generate(user_id: &str, refresh: bool, connection: Option<&DBConnection>) -> TokenResult<String> {
    if connection.is_none() && refresh {
        return Err(TokenGenerateError::InvalidSettingException(
            "When generating refresh token, DB connection is required. \
            Please set DB connection to refresh token generation.".to_string()));
    }

    let secret_key = env::var("JWT_SECRET_KEY").unwrap_or_else(|_| {
        warn!("JWT_SECRET_KEY hasn't been set as env var so jwt will be generated using \"\" as secret.");
        "".to_string()
    });
    let now = Utc::now();
    if now.timestamp() <= 0 {
        return Err(TokenGenerateError::InvalidSettingException(
            format!(
                "Current Timestamp['{}'] indicates negative(or zero) but it should positive value. \
                Please check server setting.", now.timestamp())));
    }

    let exp_time = if refresh {
        (now + Duration::hours(1)).timestamp() as u64
    }
    else {
        (now + Duration::minutes(15)).timestamp() as u64
    };

    let claims = TokenInfo::new(
        user_id.to_string(), exp_time, now.timestamp() as u64, false, refresh);

    let token = match encode(
        &Header::default(), &claims, &EncodingKey::from_secret(secret_key.as_ref())) {
        Ok(token) => token,
        Err(e) => {
            return Err(TokenGenerateError::GenerationFailedException(
                format!(
                    "jwt token generation failed: ({})", e.to_string())));
        }
    };

    if refresh {
        let uid = user_id.to_string();
        insert_refresh_token(&uid, &token, exp_time as i64, now.timestamp(), connection.unwrap()).await?;
    }

    Ok(token)
}

fn token_decode_and_verify(token: &str, custom_exp: Option<u64>) -> AuthenticateResult<TokenInfo> {
    let secret_key = env::var("JWT_SECRET_KEY").unwrap_or_else(|_| {
        warn!("JWT_SECRET_KEY hasn't been set as env var so if the JWT token is different than \"\", \
        it can't be verified");
        "".to_string()
    });

    let mut token_info = match decode::<TokenInfo>(
        &token,
        &DecodingKey::from_secret(secret_key.as_ref()),
        &Validation::default()) {
        Ok(info) => info.claims,
        Err(e) => {
            error!("Token cannot decoded due to {}", e.to_string());
            return Err(AuthenticateError::AccessTokenInvalidException("Token cannot decoded because of invalid token.".to_string()));
        }
    };

    let current_time = Utc::now().timestamp();
    if current_time <= 0 {
        return Err(AuthenticateError::InvalidSettingException(
            format!("Current Timestamp['{}'] indicates negative(or zero) but it should positive value. \
                Please check server setting.", current_time)
        ))
    };

    if let Some(custom_exp_raw) = custom_exp {
        token_info.update_exp(custom_exp_raw);
    }

    let current_time = current_time as u64;
    token_info.is_valid_token(current_time)?;

    Ok(token_info)
}

pub fn access_token_verify(access_token: &str, is_api: bool) -> AuthenticateResult<String> {
    let token_info = token_decode_and_verify(access_token, None)?;

    if is_api && !token_info.valid_for_api() {
        error!("This token is invalid for api call not via GUI.");
        return Err(AuthenticateError::AccessTokenInvalidException(
            "This token isn't allowed to use api not via GUI".to_string()
        ))
    }

    if token_info.is_refresh() {
        error!("This is refresh token. Cannot authorize access by this token.");
        return Err(AuthenticateError::AccessTokenInvalidException(
            "input token is refresh token, not access token.".to_string()
        ))
    }

    Ok(token_info.user_id())
}

pub async fn refresh_token_verify(refresh_token: &str, conn: &DBConnection) -> AuthenticateResult<(String, String)> {
    let (exp, username) = refresh_token_exp(refresh_token, conn).await?;

    let token_info = token_decode_and_verify(refresh_token, Some(exp as u64))?;

    if !token_info.is_refresh() {
        error!("This is access token. Cannot authorize this token for re-generate access token.");
        return Err(AuthenticateError::RefreshTokenInvalidException(
            "input token is access token, not refresh token".to_string()
        ))
    }
    info!("Refresh token authorized for '{}'.", token_info.user_id());

    Ok((token_info.user_id(), username))
}


