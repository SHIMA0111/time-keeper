pub mod db;
pub mod api;
pub mod token;

use log::error;
use serde::{Deserialize, Serialize};
use crate::errors::TimeKeeperError::RefreshTokenException;
use crate::errors::TimeKeeperResult;

#[derive(Serialize, Deserialize, Debug)]
pub struct TokenInfo {
    uid: String,
    exp: i64,
    iat: i64,
    refresh: bool,
}

impl TokenInfo {
    pub fn new(uid: String, exp: i64, iat: i64, refresh: bool) -> Self {
        TokenInfo { uid, exp, iat, refresh }
    }

    pub(crate) fn user_id(&self) -> String {
        self.uid.clone()
    }

    pub(crate) fn is_refresh(&self) -> bool {
        self.refresh
    }

    pub(crate) fn update_exp(&mut self, custom_exp: i64) -> () {
        if self.refresh {
            self.exp = custom_exp;
        }
    }

    pub(crate) fn is_valid_refresh_token(&self, base_time: i64) -> TimeKeeperResult<()> {
        if self.exp < self.iat {
            error!("token is invalid due to exp time({}) lower than iat time({}).", self.exp, self.iat);

            let message = "token setting is wrong. create timestamp is higher than expired time.";

            return Err(RefreshTokenException(message.to_string()))
        }
        if base_time < self.iat {
            error!("input token will be generated in the future. (base: {}, token_iat: {})", base_time, self.iat);

            let message = "token setting is wrong. the create timestamp indicates the future.";

            return Err(RefreshTokenException(message.to_string()))
        }
        if self.exp < base_time {
            error!("token is expired. (base: {}, token_exp: {})", base_time, self.exp);

            let message = format!("The expired time is {}", self.exp);

            return Err(RefreshTokenException(message))
        }

        Ok(())
    }
}
