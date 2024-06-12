use std::str::FromStr;
use uuid::Uuid;
use crate::data::connector::DBConnection;
use crate::utils::error::TimeKeeperError::{InvalidSettingException, UuidParseException};
use crate::utils::types::TimeKeeperResult;

pub mod insert;
pub mod delete;
pub mod get;
pub mod update;
pub mod create_table;
pub mod drop_table;

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

fn get_constraint_name(on_table: &str, foreign_table: &str) -> String {
    format!("{}_{}_fk", on_table, foreign_table)
}

fn get_join_statement_by_table(conn: &DBConnection) -> TimeKeeperResult<String> {

}
