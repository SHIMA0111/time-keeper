use uuid::Uuid;
use crate::db::DBConnection;
use crate::errors::TimeKeeperResult;
use crate::types::db::alias::Alias;

pub async fn create_alias(alias_info: Alias, user_id: Uuid, conn: &DBConnection) -> TimeKeeperResult<Uuid> {
    
}