use std::env;
use chrono::{Duration, Utc};
use jsonwebtoken::{decode, DecodingKey, encode, EncodingKey, Header, Validation};
use log::{error, warn};
use crate::data::connector::DBConnection;
use crate::utils::error::{AuthenticateError, TokenGenerateError};
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
        (now + Duration::hours(24)).timestamp() as u64
    }
    else {
        (now + Duration::minutes(15)).timestamp() as u64
    };

    let claims = TokenInfo::new(
        user_id.to_string(), exp_time, now.timestamp() as u64, refresh);

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
        let statement = match connection.unwrap().client()
            .prepare("INSERT INTO time_schema.refresh_token (uid, token, exp, iat) \
            VALUES ($1, $2, $3, $4)").await {
            Ok(statement) => statement,
            Err(e) => {
                return Err(TokenGenerateError::GenerationFailedException(
                    format!(
                        "refresh token cannot register: ({})", e.to_string()
                    )
                ))
            }
        };
        let res = connection.unwrap().client()
            .execute(&statement, &[&uid, &token, &(exp_time as i64), &(now.timestamp())]).await;

        if let Err(_) = res {
            return Err(TokenGenerateError::GenerationFailedException(
                "token generation failed due to failed to resister the token.".to_string()
            ));
        }
    }

    Ok(token)
}

fn token_decode_and_verify(access_token: &str) -> AuthenticateResult<TokenInfo> {
    let secret_key = env::var("JWT_SECRET_KEY").unwrap_or_else(|_| {
        warn!("JWT_SECRET_KEY hasn't been set as env var so if the JWT token is different than \"\", \
        it can't be verified");
        "".to_string()
    });

    let token_info = match decode::<TokenInfo>(
        &access_token,
        &DecodingKey::from_secret(secret_key.as_ref()),
        &Validation::default()) {
        Ok(info) => info.claims,
        Err(e) => {
            return Err(AuthenticateError::AccessTokenInvalidException(e.to_string()))
        }
    };

    let current_time = Utc::now().timestamp();
    if current_time <= 0 {
        return Err(AuthenticateError::InvalidSettingException(
            format!("Current Timestamp['{}'] indicates negative(or zero) but it should positive value. \
                Please check server setting.", current_time)
        ))
    };

    let current_time = current_time as u64;
    token_info.is_valid_token(current_time)?;

    Ok(token_info)
}

pub fn access_token_verify(access_token: &str) -> AuthenticateResult<()> {
    let token_info = token_decode_and_verify(access_token)?;

    if token_info.is_refresh() {
        error!("This is refresh token. Cannot authorize access by this token.");
        return Err(AuthenticateError::AccessTokenInvalidException(
            "input token is refresh token, not access token.".to_string()
        ))
    }

    Ok(())
}

pub fn refresh_token_verify(refresh_token: &str) -> AuthenticateResult<()> {
    let token_info = token_decode_and_verify(refresh_token)?;

    if !token_info.is_refresh() {
        error!("This is access token. Cannot authorize this token for re-generate access token.");
        return Err(AuthenticateError::RefreshTokenInvalidException(
            "input token is access token, not refresh token".to_string()
        ))
    }

    Ok(())
}


