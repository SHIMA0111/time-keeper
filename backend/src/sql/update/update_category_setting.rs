use log::error;
use tokio_postgres::Transaction;
use tokio_postgres::types::ToSql;
use uuid::Uuid;
use crate::errors::TimeKeeperError::DBCURDException;
use crate::errors::TimeKeeperResult;
use crate::sql::SCHEMA_NAME;
use crate::sql::update::transaction_update;

const CATEGORY_TABLE: [&str; 5] =
    ["main_category", "sub1_category", "sub2_category", "sub3_category", "sub4_category"];

pub async fn update_category_setting(category_id: Uuid,
                                     category_name: String,
                                     table_name: String,
                                     superior_id: Option<Uuid>,
                                     allow_no_update: bool,
                                     transaction: &Transaction<'_>) -> TimeKeeperResult<()> {
    let (statement_str, params) = if table_name == "main_category" {
        let stmt = format!("UPDATE {}.main_category SET name=$1 WHERE id=$2", SCHEMA_NAME);
        let params: Vec<&(dyn ToSql + Sync)> = vec![&category_name, &category_id];
        (stmt, params)
    } else {
        let stmt = format!("UPDATE {}.{} SET name=$1, superior_id=$2 WHERE id=$3", SCHEMA_NAME, table_name);
        let params: Vec<&(dyn ToSql + Sync)> = vec![&category_name, &superior_id, &category_id];
        (stmt, params)
    };
    let update_num =
        transaction_update(&statement_str, &params, transaction).await?;

    if update_num == 0 && !allow_no_update {
        error!("Failed to update category setting.");
        return Err(DBCURDException("category setting update number indicates 0".to_string()));
    };

    Ok(())
}

pub async fn remove_category(category_id: Uuid,
                             table_name: String,
                             transaction: &Transaction<'_>) -> TimeKeeperResult<()> {
    let child_table = if CATEGORY_TABLE.contains(&&*table_name) {
        let position = CATEGORY_TABLE.iter().position(|&x| x == table_name).unwrap();
        if position + 1 >= CATEGORY_TABLE.len() {
            None
        }
        else {
            Some(CATEGORY_TABLE[position + 1])
        }
    } else {
        error!("table_name='' is invalid name. Please contact the developer");
        return Err(DBCURDException("invalid table_name is inputted.".to_string()));
    };

    update_child_superior_id_to_null(child_table.unwrap(), category_id, transaction).await?;

    let statement_str = format!("UPDATE {}.{} SET is_deleted=TRUE WHERE id=$1", SCHEMA_NAME, table_name);
    let update_num = transaction_update(&statement_str, &[&category_id], transaction).await?;

    if update_num == 0 {
        error!("Failed to soft delete the category of '{}'", category_id);
        return Err(DBCURDException("category setting update number indicates 0".to_string()));
    };

    Ok(())
}

async fn update_child_superior_id_to_null(table_name: &str,
                                          target_id: Uuid,
                                          transaction: &Transaction<'_>) -> TimeKeeperResult<()> {
    let statement_str = format!("UPDATE {}.{} SET superior_id=NULL WHERE superior_id=$1", SCHEMA_NAME, table_name);
    transaction_update(&statement_str, &[&target_id], transaction).await?;
    Ok(())
}
