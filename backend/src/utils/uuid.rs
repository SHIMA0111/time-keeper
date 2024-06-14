use std::str::FromStr;
use log::error;
use uuid::Uuid;
use crate::errors::TimeKeeperError::ParseException;
use crate::errors::TimeKeeperResult;

pub fn uuid_from_string(user_id: &str) -> TimeKeeperResult<Uuid> {
    match Uuid::from_str(user_id) {
        Ok(uuid) => Ok(uuid),
        Err(e) => {
            error!("'{}' cannot parse Uuid due to {:?}", user_id, e);
            Err(ParseException("invalid uuid format".to_string()))
        },
    }
}