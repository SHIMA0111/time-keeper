use uuid::Uuid;
use crate::db::DBConnection;
use crate::errors::TimeKeeperResult;
use crate::sql::get::get_all;
use crate::sql::SCHEMA_NAME;
use crate::types::db::category::{CategoryContents, Category};
use crate::types::db::category_setting::TableSetting;

pub async fn get_specified_category(user_id: Uuid,
                                    table_info: &[TableSetting],
                                    conn: &DBConnection) -> TimeKeeperResult<Vec<Category>> {

    let mut res_vec = Vec::<Category>::with_capacity(5);

    for table in table_info {
        let statement_str = format!(
            "SELECT * FROM {}.{} WHERE created_user_id = $1 AND is_deleted IS FALSE",
            SCHEMA_NAME, table.table_name());

        let rows = get_all(&statement_str, &[&user_id], conn.client()).await?;

        let category = rows.into_iter().map(|row| {
            let superior_id = if table.table_name() == "main_category" {
                None
            } else {
                row.get::<_, Option<Uuid>>("superior_id")
            };

            CategoryContents::new(
                row.get("id"),
                row.get("name"),
                superior_id
            )
        }).collect::<Vec<_>>();

        res_vec.push(Category::new(table.table_name(), table.display_name(), category))
    }

    Ok(res_vec)
}
