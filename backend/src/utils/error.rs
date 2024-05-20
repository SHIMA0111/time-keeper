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
}

impl Display for AuthenticateError {
    fn fmt(&self, f: &mut Formatter<'_>) -> std::fmt::Result {
        match self {
            Self::DBConnectionException(e) => write!(f, "DB connection failed due to: {}", e),
            Self::RegisterAuthenticationException(e) => write!(f, "Register failed by : {}", e),
        }
    }
}

impl Error for AuthenticateError {}
