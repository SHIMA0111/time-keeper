use log::error;
use tokio_postgres::types::ToSql;
use crate::db::DBConnection;
use crate::errors::TimeKeeperError::DBCURDException;
use crate::errors::TimeKeeperResult;
use crate::sql::insert::insert;
use crate::sql::SCHEMA_NAME;
use crate::types::db::category::CreateCategory;

pub async fn create_category(category: &CreateCategory, conn: &DBConnection) -> TimeKeeperResult<()> {
    let table_name = category.table_name();
    let new_id = category.id();
    let name = category.name();
    let created_user_id = category.created_user_id();
    let superior_id = category.superior_id();

    let (statement_str, params) = if table_name == "main_category" {
        let stmt = format!(
            "INSERT INTO {}.{} (id, name, created_user_id) VALUES ($1, $2, $3)",
            SCHEMA_NAME, table_name);
        let params: Vec<&(dyn ToSql + Sync)> = vec![&new_id, &name, &created_user_id];
        (stmt, params)

    } else {
        let stmt = format!(
            "INSERT INTO {}.{} (id, name, superior_id, created_user_id) VALUE ($1, $2, $3, $4)",
            SCHEMA_NAME, table_name);
        let params: Vec<&(dyn ToSql + Sync)> = vec![&new_id, &name, &created_user_id, &superior_id];
        (stmt, params)
    };

    let res = insert(&statement_str, &params, conn.client()).await?;
    if res == 0 {
        error!("Failed to create new category.");
        return Err(DBCURDException("insert number indicates 0".to_string()));
    }

    Ok(())
}