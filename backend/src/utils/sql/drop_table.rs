use log::{error, info, warn};
use crate::data::connector::DBConnection;
use crate::utils::error::TimeKeeperError::{DBConnectionException, DropFailedException, InvalidSettingException, QueryDataException};
use crate::utils::sql::{get_constraint_name, SCHEMA_NAME};
use crate::utils::types::TimeKeeperResult;

pub(crate) async fn drop_table(table_name: &str, conn: &mut DBConnection) -> TimeKeeperResult<()> {
    let transaction = conn.transaction().await?;

    let table_query_stmt = format!("SELECT * FROM {}.category_setting WHERE table_name=$1 AND is_invalid=FALSE", SCHEMA_NAME);
    let table_query = transaction.query(&table_query_stmt, &[&table_name]).await;
    if let Err(e) = table_query {
        error!("Table information cannot be gotten due to [{:?}]", e);
        return Err(QueryDataException("Cannot get table information".to_string()));
    }

    if table_query.unwrap().len() == 0 {
        error!("Cannot find input table('{}') in table list", table_name);
        return Err(InvalidSettingException("Cannot drop table because the table doesn't exist".to_string()));
    }
    else if table_name == "main_category" {
        warn!("'main_category' cannot be deleted. killed process and revoked.");
        return Err(InvalidSettingException("Never delete 'main_table'. This is default category.".to_string()));
    }

    let query_foreign_table_stmt = format!(
        "SELECT table_name FROM {}.category_setting WHERE superior_table=$1 AND is_invalid=FALSE", SCHEMA_NAME);
    let on_table_rows =
        transaction.query(&query_foreign_table_stmt, &[&table_name]).await;
    if let Err(e) = on_table_rows {
        error!("Failed to get data of relation between tables because [{:?}]", e);
        return Err(DBConnectionException("Cannot get relation between table.".to_string()));
    }
    let on_table_rows = on_table_rows.unwrap();
    for row in &on_table_rows {
        let dist_table_name: &str = row.get("table_name");
        let constraint_name = get_constraint_name(dist_table_name, table_name);

        let foreign_stmt = format!("UPDATE {}.{} SET superior_category_id=NULL", SCHEMA_NAME, dist_table_name);
        let foreign_update = transaction.execute(&foreign_stmt, &[]).await;
        if let Err(e) = foreign_update {
            error!("Failed to update for consistent foreign table due to [{:?}]", e);
            return Err(InvalidSettingException("Cannot update foreign key".to_string()));
        }

        let update_superior_table =
            format!("UPDATE {}.category_setting SET superior_table=NULL", SCHEMA_NAME);
        if let Err(e) = transaction.execute(&update_superior_table, &[]).await {
            error!("Failed to update foreign key setting due to [{:?}]", e);
            return Err(InvalidSettingException("Cannot update foreign table relation".to_string()));
        }

        let drop_constraint_stmt = format!(
            "ALTER TABLE {}.{} DROP CONSTRAINT {}", SCHEMA_NAME, dist_table_name, constraint_name);
        let drop_constraint = transaction.execute(&drop_constraint_stmt, &[]).await;
        if let Err(e) = drop_constraint {
            error!("Failed to drop constraint('{}') due to [{:?}]", constraint_name, e);
            return Err(DropFailedException("Failed to drop constraint".to_string()));
        }
    }

    let invalidate_table_stmt =
        format!("UPDATE {}.category_setting SET is_invalid=TRUE WHERE table_name=$1", SCHEMA_NAME);
    if let Err(e) = transaction.execute(&invalidate_table_stmt, &[&table_name]).await {
        error!("Failed to invalidate table setting due to [{:?}]", e);
        return Err(DropFailedException("Failed to invalidate table setting".to_string()));
    }

    let drop_table_stmt = format!("DROP TABLE {}.{}", SCHEMA_NAME, table_name);
    if let Err(e) = transaction.execute(&drop_table_stmt, &[]).await {
        error!("Failed to drop table('{}') due to [{:?}]", table_name, e);
        return Err(DropFailedException("Cannot drop table".to_string()))
    };

    match transaction.commit().await {
        Ok(_) => {
            info!("Complete update related table constraint");
            info!("Drop constraint from related tables");
            info!("Complete drop table");
            Ok(())
        },
        Err(e) => {
            error!("Failed to commit the table drop process by [{:?}]", e);
            Err(DropFailedException("Failed to commit drop table".to_string()))
        }
    }
}