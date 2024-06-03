use log::{debug, error, info};
use crate::data::connector::DBConnection;
use crate::utils::error::TimeKeeperError::InvalidSettingException;
use crate::utils::types::TimeKeeperResult;

pub(crate) async  fn create_main_category_table(display_name: &str, category_num: u8, conn: &DBConnection) -> TimeKeeperResult<()> {
    let superior_category_table = if category_num == 1 {
        "main_category".to_string()
    }
    else {
        format!("sub_category{}", category_num - 1)
    };

    let new_category_table = format!("sub_category{}", category_num);

    let stmt = format!("CREATE TABLE IF NOT EXISTS {}
        (
            id serial PRIMARY KEY,
            name varchar not null,
            created_timestamp timestamp,
            created_user_id uuid not null,
            superior_category_id integer,
            is_deleted bool DEFAULT FALSE,
            FOREIGN KEY (superior_category_id) REFERENCES {} (id)
        )", new_category_table, superior_category_table);
    match conn.client().execute(
        &stmt,
        &[]
    ).await {
        Ok(value) => {
            info!("'{}' is created. Now the {} categories exist (include 'main_table')",
                new_category_table, category_num + 1);
            debug!("{} table(s) created as '{}'.", value, new_category_table);
            Ok(())
        },
        Err(e) => {
            error!("Create new table failed due to {}", e.to_string());
            Err(InvalidSettingException(format!("Failed to create new category of {}", new_category_table)))
        }
    }
}