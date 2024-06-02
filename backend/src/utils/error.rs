use std::error::Error;
use std::fmt::{Display, Formatter};

#[derive(Debug, PartialEq)]
pub enum TimeKeeperError {
    DBConnectionException(String),
    RegisterAuthenticationException(String),
    AccessTokenInvalidException(String),
    RefreshTokenExpiredException(String),
    RefreshTokenInvalidException(String),
    InvalidSettingException(String),
    GenerationFailedException(String),
    HashProcessException,
    UuidParseException
}

impl Display for TimeKeeperError {
    fn fmt(&self, f: &mut Formatter<'_>) -> std::fmt::Result {
        match self {
            Self::DBConnectionException(e) => write!(f, "DB connection failed due to: {}", e),
            Self::RegisterAuthenticationException(e) => write!(f, "Register failed by : {}", e),
            Self::AccessTokenInvalidException(e) => write!(f, "Access Token is invalid due to: {}", e),
            Self::RefreshTokenExpiredException(e) => write!(f, "Refresh Token was expired ({})", e),
            Self::RefreshTokenInvalidException(e) => write!(f, "Refresh Token is invalid due to: {}", e),
            Self::InvalidSettingException(e) => write!(f, "Detect invalid system setting because from: {}", e),
            Self::GenerationFailedException(e) => write!(f, "Generation failed by {}", e),
            Self::HashProcessException => write!(f, "Password Hasher return exception. Please see the log"),
            Self::UuidParseException => write!(f, "Invalid user_id was inputted."),
        }
    }
}

impl Error for TimeKeeperError {}