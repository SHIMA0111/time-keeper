use std::error::Error;
use std::fmt::{Display, Formatter};

#[derive(Debug, PartialEq)]
pub enum TimeKeeperError {
    AccessTokenInvalidException(String),
    CreateTableException(String),
    DBConnectionException(String),
    GenerationFailedException(String),
    InvalidSettingException(String),
    QueryDataException(String),
    RegisterAuthenticationException(String),
    RefreshTokenExpiredException(String),
    RefreshTokenInvalidException(String),
    ExceedCategoryTableException,
    HashProcessException,
    UuidParseException
}

impl Display for TimeKeeperError {
    fn fmt(&self, f: &mut Formatter<'_>) -> std::fmt::Result {
        match self {
            Self::AccessTokenInvalidException(e) => write!(f, "Access Token is invalid due to: {}", e),
            Self::CreateTableException(e) => write!(f, "Table creation failed due to: {}", e),
            Self::DBConnectionException(e) => write!(f, "DB connection failed due to: {}", e),
            Self::GenerationFailedException(e) => write!(f, "Generation failed by {}", e),
            Self::InvalidSettingException(e) => write!(f, "Detect invalid system setting because from: {}", e),
            Self::QueryDataException(e) => write!(f, "Query data failed because of: {}", e),
            Self::RegisterAuthenticationException(e) => write!(f, "Register failed by : {}", e),
            Self::RefreshTokenExpiredException(e) => write!(f, "Refresh Token was expired ({})", e),
            Self::RefreshTokenInvalidException(e) => write!(f, "Refresh Token is invalid due to: {}", e),
            Self::ExceedCategoryTableException => write!(f, "Category table is limited up to 5"),
            Self::HashProcessException => write!(f, "Password Hasher return exception. Please see the log"),
            Self::UuidParseException => write!(f, "Invalid user_id was inputted."),
        }
    }
}

impl Error for TimeKeeperError {}