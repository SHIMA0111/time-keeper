use std::error::Error;
use std::fmt::{Display, Formatter};

pub type TimeKeeperResult<T> = Result<T, TimeKeeperError>;

#[derive(Debug, PartialEq)]
pub enum TimeKeeperError {
    DBCURDException(String),
    DBTransactionException(String),
    UserAuthenticationException(String),
    PasswordHashException(String),
    AccessTokenException(String),
    RefreshTokenException(String),
    EnvironmentSettingException(String),
    ParseException(String)
}

impl Display for TimeKeeperError {
    fn fmt(&self, f: &mut Formatter<'_>) -> std::fmt::Result {
        match self {
            Self::DBCURDException(reason) => write!(f, "DB CURD process failed due to {}", reason),
            Self::DBTransactionException(reason) => write!(f, "DB transaction process failed due to {}", reason),
            Self::UserAuthenticationException(reason) => write!(f, "Authentication failed due to {}", reason),
            Self::PasswordHashException(reason) => write!(f, "Password hash failed due to {}", reason),
            Self::AccessTokenException(reason) => write!(f, "Access token process failed due to {}", reason),
            Self::RefreshTokenException(reason) => write!(f, "Refresh token process failed due to {}", reason),
            Self::EnvironmentSettingException(reason) => write!(f, "Environment seems to have wrong setting due to {}", reason),
            Self::ParseException(reason) => write!(f, "Parse process failed due to {}", reason),
        }
    }
}

impl Error for TimeKeeperError {}