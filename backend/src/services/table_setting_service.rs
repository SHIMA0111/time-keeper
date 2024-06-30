use futures_util::future::join_all;
use log::error;
use uuid::Uuid;
use crate::db::DBConnection;
use crate::errors::TimeKeeperError::DBCURDException;
use crate::errors::TimeKeeperResult;
use crate::services::category_service::get_category_service;
use crate::sql::get::get_table_setting::get_all_table_setting;
use crate::sql::update::update_table_setting::update_table_setting;
use crate::types::db::category::Category;
use crate::types::db::category_setting::TableSetting;

pub async fn get_table_setting_service(user_id: Uuid,
                                       conn: &DBConnection) -> TimeKeeperResult<Vec<TableSetting>> {
    get_all_table_setting(user_id, conn).await
}

pub async fn update_table_setting_service(update_data: &[&TableSetting],
                                          user_id: Uuid,
                                          conn: &mut DBConnection) -> TimeKeeperResult<Vec<Category>> {
    let transaction = conn.transaction().await?;

    let mut async_vec = Vec::new();

    for data in update_data {
        let table_name = data.table_name();
        let display_name = data.display_name();
        let is_invalid = data.is_invalid();

        let update_task = update_table_setting(
            user_id, table_name, display_name, is_invalid, true, &transaction);
        async_vec.push(update_task);
    };
    let results = join_all(async_vec).await;
    for result in results {
        result?;
    }

    let commit_res = transaction.commit().await;
    if let Err(e) = commit_res {
        error!("Failed to update transaction by {:?}", e);
        return Err(DBCURDException("Failed to commit update table_setting".to_string()));
    }

    get_category_service(user_id, conn).await
}
