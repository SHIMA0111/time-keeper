use tokio_postgres::Row;
use uuid::Uuid;
use crate::db::DBConnection;
use crate::errors::TimeKeeperResult;
use crate::sql::get::get_all;
use crate::sql::SCHEMA_NAME;
use crate::types::db::category_setting::CategorySetting;

pub fn get_category_setting(rows: &[Row]) -> Vec<CategorySetting> {
    rows.iter().map(|row| CategorySetting::new(
        row.get("table_name"),
        row.get("display_name"),
    )).collect::<Vec<CategorySetting>>()
}

pub async fn get_all_category_setting(user_id: Uuid,
                                      conn: &DBConnection) -> TimeKeeperResult<Vec<CategorySetting>> {
    let statement_str = format!(
        "SELECT * FROM {}.category_setting WHERE user_id=$1", SCHEMA_NAME);
    let rows = get_all(&statement_str, &[&user_id], conn.client()).await?;

    Ok(get_category_setting(&rows))
}

pub async fn get_validate_category_setting(user_id: Uuid,
                                           conn: &DBConnection) -> TimeKeeperResult<Vec<CategorySetting>> {
    let statement_str = format!(
        "SELECT * FROM {}.category_setting WHERE user_id=$1 AND is_invalid IS FALSE", SCHEMA_NAME);
    let rows = get_all(&statement_str, &[&user_id], conn.client()).await?;

    Ok(get_category_setting(&rows))
}