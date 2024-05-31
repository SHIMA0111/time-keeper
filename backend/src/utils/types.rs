use log::error;
use serde::{Deserialize, Serialize};
use tokio_postgres::{Error as PGError};
use crate::utils::error::{AuthenticateError, TokenGenerateError};

pub(crate) type PGResult<T> = Result<T, PGError>;
pub(crate) type TokenResult<T> = Result<T, TokenGenerateError>;
pub(crate) type AuthenticateResult<T> = Result<T, AuthenticateError>;

#[derive(Serialize, Deserialize, Debug)]
pub struct TokenInfo {
    uid: String,
    exp: u64,
    iat: u64,
    api: bool,
    refresh: bool,
}

impl TokenInfo {
    pub fn new(uid: String, exp: u64, iat: u64, api: bool, refresh: bool) -> Self {
        TokenInfo { uid, exp, iat, api, refresh }
    }

    pub(crate) fn user_id(&self) -> String {
        self.uid.clone()
    }

    pub(crate) fn is_refresh(&self) -> bool {
        self.refresh
    }

    pub(crate) fn valid_for_api(&self) -> bool {
        self.api
    }

    pub(crate) fn update_exp(&mut self, custom_exp: u64) -> () {
        if self.refresh {
            self.exp = custom_exp;
        }
    }

    pub(crate) fn is_valid_token(&self, base_time: u64) -> AuthenticateResult<()> {
        if self.exp < self.iat {
            error!("token is invalid due to exp time({}) lower than iat time({}).", self.exp, self.iat);

            let message = "token setting is wrong. create timestamp is higher than expired time.";

            return if self.refresh {
                Err(AuthenticateError::RefreshTokenExpiredException(message.to_string()))
            } else {
                Err(AuthenticateError::AccessTokenInvalidException(message.to_string()))
            }
        }
        if base_time < self.iat {
            error!("input token will be generated in the future. (base: {}, token_iat: {})", base_time, self.iat);

            let message = "token setting is wrong. the create timestamp indicates the future.";
            return if self.refresh {
                Err(AuthenticateError::RefreshTokenExpiredException(message.to_string()))
            } else {
                Err(AuthenticateError::AccessTokenInvalidException(message.to_string()))
            }
        }
        if self.exp < base_time {
            error!("token is expired. (base: {}, token_exp: {})", base_time, self.exp);

            let message = format!("The expired time is {}", self.exp);

            return if self.refresh {
                Err(AuthenticateError::RefreshTokenExpiredException(message))
            } else {
                Err(AuthenticateError::AccessTokenExpiredException(message))
            }
        }

        Ok(())
    }
}

