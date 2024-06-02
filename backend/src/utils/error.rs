use std::error::Error;
use std::fmt::{Display, Formatter};

#[derive(Debug, PartialEq)]
pub enum TokenGenerateError {
    InvalidSettingException(String),
    GenerationFailedException(String),
}

impl Display for TokenGenerateError {
    fn fmt(&self, f: &mut Formatter<'_>) -> std::fmt::Result {
        match self {
            Self::InvalidSettingException(e) => write!(f, "Process failed by invalid setting: {}", e),
            Self::GenerationFailedException(e) => write!(f, "Generation failed by {}", e),
        }
    }
}

impl Error for TokenGenerateError {}


#[derive(Debug, PartialEq)]
pub enum AuthenticateError {
    DBConnectionException(String),
    RegisterAuthenticationException(String),
    AccessTokenExpiredException(String),
    AccessTokenInvalidException(String),
    RefreshTokenExpiredException(String),
    RefreshTokenInvalidException(String),
    InvalidSettingException(String),
    HashProcessException,
}

impl Display for AuthenticateError {
    fn fmt(&self, f: &mut Formatter<'_>) -> std::fmt::Result {
        match self {
            Self::DBConnectionException(e) => write!(f, "DB connection failed due to: {}", e),
            Self::RegisterAuthenticationException(e) => write!(f, "Register failed by : {}", e),
            Self::AccessTokenExpiredException(e) => write!(f, "Access Token was expired ({})", e),
            Self::AccessTokenInvalidException(e) => write!(f, "Access Token is invalid due to: {}", e),
            Self::RefreshTokenExpiredException(e) => write!(f, "Refresh Token was expired ({})", e),
            Self::RefreshTokenInvalidException(e) => write!(f, "Refresh Token is invalid due to: {}", e),
            Self::InvalidSettingException(e) => write!(f, "Detect invalid system setting because from: {}", e),
            Self::HashProcessException => write!(f, "Password Hasher return exception. Please see the log"),
        }
    }
}

impl Error for AuthenticateError {}
