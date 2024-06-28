use tokio_postgres::Row;
use uuid::Uuid;
use crate::db::DBConnection;
use crate::errors::TimeKeeperResult;
use crate::sql::get::get_all;
use crate::sql::SCHEMA_NAME;
use crate::types::db::category_setting::TableSetting;

pub fn get_table_setting(rows: &[Row]) -> Vec<TableSetting> {
    rows.iter().map(|row| TableSetting::new(
        row.get("table_name"),
        row.get("display_name"),
        row.get("is_invalid")
    )).collect::<Vec<TableSetting>>()
}

pub async fn get_all_table_setting(user_id: Uuid,
                                   conn: &DBConnection) -> TimeKeeperResult<Vec<TableSetting>> {
    let statement_str = format!(
        "SELECT * FROM {}.category_setting WHERE user_id=$1", SCHEMA_NAME);
    let rows = get_all(&statement_str, &[&user_id], conn.client()).await?;

    Ok(get_table_setting(&rows))
}

pub async fn get_validate_table_setting(user_id: Uuid,
                                        conn: &DBConnection) -> TimeKeeperResult<Vec<TableSetting>> {
    let statement_str = format!(
        "SELECT * FROM {}.category_setting WHERE user_id=$1 AND is_invalid IS FALSE", SCHEMA_NAME);
    let rows = get_all(&statement_str, &[&user_id], conn.client()).await?;

    Ok(get_table_setting(&rows))
}