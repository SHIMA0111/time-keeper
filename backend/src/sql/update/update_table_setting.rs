use log::error;
use tokio_postgres::Transaction;
use uuid::Uuid;
use crate::errors::TimeKeeperError::DBCURDException;
use crate::errors::TimeKeeperResult;
use crate::sql::SCHEMA_NAME;
use crate::sql::update::{transaction_update};

pub async fn update_table_setting(user_id: Uuid,
                                  table_name: String,
                                  display_name: String,
                                  is_invalid: bool,
                                  allow_no_update: bool,
                                  transaction: &Transaction<'_>) -> TimeKeeperResult<()> {
    let statement_str = format!(
        "UPDATE {}.category_setting SET display_name=$1, is_invalid=$2 WHERE user_id=$3 AND table_name=$4",
        SCHEMA_NAME
    );

    let updated_num =
        transaction_update(&statement_str,
                           &[&display_name, &is_invalid, &user_id, &table_name],
                           transaction).await?;

    if updated_num == 0 && !allow_no_update {
        error!("Failed to update table setting.");
        return Err(DBCURDException("table_setting update number indicates 0".to_string()));
    }

    Ok(())
}