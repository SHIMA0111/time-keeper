use serde::{Deserialize, Serialize};
use tokio_postgres::{Error as PGError};
use crate::utils::error::TokenGenerateError;

pub(crate) type PGResult<T> = Result<T, PGError>;
pub(crate) type TokenResult<T> = Result<T, TokenGenerateError>;

#[derive(Serialize, Deserialize, Debug)]
pub struct TokenInfo {
    uid: String,
    exp: u64,
    iat: u64,
    refresh: bool,
}

impl TokenInfo {
    pub fn new(uid: String, exp: u64, iat: u64, refresh: bool) -> Self {
        TokenInfo { uid, exp, iat, refresh }
    }
}

