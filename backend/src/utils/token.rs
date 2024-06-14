use std::env;
use chrono::{DateTime, Duration, Utc};
use jsonwebtoken::{decode, DecodingKey, encode, EncodingKey, Header, Validation};
use log::{error, info};
use uuid::Uuid;
use crate::errors::TimeKeeperError::{AccessTokenException, EnvironmentSettingException, RefreshTokenException};
use crate::errors::TimeKeeperResult;
use crate::types::db::refresh_token::RefreshToken;
use crate::types::token::Token;
use crate::types::TokenInfo;

fn get_now() -> TimeKeeperResult<DateTime<Utc>> {
    let now = Utc::now();
    if now.timestamp() <= 0 {
        return Err(EnvironmentSettingException(
            format!("unix timestamp indicates negative or zero({})", now.timestamp())));
    };
    Ok(now)
}

pub fn generate_jwt_token(user_id: Uuid, is_refresh: bool) -> TimeKeeperResult<Token> {
    let secret_key = env::var("JWT_SECRET_KEY").unwrap_or_else(|_| {
        "".to_string()
    });

    let now = get_now()?;

    let exp_time = if is_refresh {
        (now + Duration::hours(1)).timestamp()
    }
    else {
        (now + Duration::minutes(5)).timestamp()
    };

    let claims = TokenInfo::new(
        user_id.to_string(), exp_time, now.timestamp(), is_refresh);

    let token = match encode(
        &Header::default(), &claims, &EncodingKey::from_secret(secret_key.as_ref())) {
        Ok(token) => token,
        Err(e) => {
            error!("JWT token generation failed due to {:?} (is_refresh={})", e, is_refresh);
            return Err(
                if is_refresh {
                    RefreshTokenException("jwt token generation failed".to_string())
                } else {
                    AccessTokenException("jwt token generation failed".to_string())
                });
        }
    };

    let token = Token::new(token, now.timestamp(), exp_time);

    Ok(token)
}

fn token_decode_and_verify(token: &str, custom_exp: Option<i64>, is_refresh: bool) -> TimeKeeperResult<TokenInfo> {
    let secret_key = env::var("JWT_SECRET_KEY").unwrap_or_else(|_| "".to_string());

    let validation = if is_refresh {
        let mut validation = Validation::default();
        validation.leeway = 0;
        validation
    } else {
        let mut validation = Validation::default();
        validation.validate_exp = false;
        validation
    };

    let mut token_info = match decode::<TokenInfo>(
        &token,
        &DecodingKey::from_secret(secret_key.as_ref()),
        &validation) {
        Ok(info) => info.claims,
        Err(e) => {
            error!("Token cannot decoded due to {}", e.to_string());
            return Err(if is_refresh {
                RefreshTokenException("invalid token".to_string())
            } else {
                AccessTokenException("invalid token".to_string())
            });
        }
    };

    let now = get_now()?;

    let current_time = now.timestamp();

    if is_refresh {
        if let Some(custom_exp_raw) = custom_exp {
            token_info.update_exp(custom_exp_raw);
        }

        token_info.is_valid_refresh_token(current_time)?;
    }

    Ok(token_info)
}

pub fn access_token_verify(access_token: &str) -> TimeKeeperResult<String> {
    let token_info = token_decode_and_verify(access_token, None, false)?;

    if token_info.is_refresh() {
        error!("This is refresh token. Cannot authorize access by this token.");
        return Err(AccessTokenException("this is not valid access token".to_string()))
    }

    Ok(token_info.user_id())
}

pub async fn refresh_token_verify(refresh_token: &RefreshToken) -> TimeKeeperResult<String> {
    let exp = refresh_token.exp();
    let refresh_token = refresh_token.token();


    let token_info = token_decode_and_verify(&refresh_token, Some(exp), true)?;

    if !token_info.is_refresh() {
        error!("This is access token. Cannot authorize this token for re-generate access token.");
        return Err(RefreshTokenException("this is not valid refresh token".to_string()));
    }
    info!("Refresh token authorized for '{}'.", token_info.user_id());

    Ok(token_info.user_id())
}
