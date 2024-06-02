use std::str::FromStr;
use uuid::Uuid;
use crate::utils::error::TimeKeeperError::{InvalidSettingException, UuidParseException};
use crate::utils::types::TimeKeeperResult;

pub mod insert;
pub mod delete;
pub mod get;
pub mod update;

const SCHEMA_NAME: &str = "time_schema";
fn uuid_from_string(user_id: &str) -> TimeKeeperResult<Uuid> {
    match Uuid::from_str(user_id) {
        Ok(uuid) => Ok(uuid),
        Err(_) => Err(UuidParseException),
    }
}

fn get_uuid(user_id: &str) -> TimeKeeperResult<Uuid> {
    match uuid_from_string(user_id) {
        Ok(uuid) => Ok(uuid),
        Err(e) => Err(InvalidSettingException(e.to_string())),
    }
}

