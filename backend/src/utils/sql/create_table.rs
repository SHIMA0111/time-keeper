use log::{debug, error, info, warn};
use crate::data::connector::DBConnection;
use crate::utils::error::TimeKeeperError::{
    CreateTableException,
    ExceedCategoryTableException,
    GenerationFailedException,
    InvalidSettingException,
    QueryDataException};
use crate::utils::sql::{get_constraint_name, SCHEMA_NAME};
use crate::utils::types::TimeKeeperResult;

pub(crate) async fn create_sub_category_table(superior_table: &str,
                                              name_ja: &str,
                                              name_en: &str,
                                              conn: &mut DBConnection) -> TimeKeeperResult<()> {
    let transaction = conn.transaction().await?;

    let category_get_stmt = format!("SELECT table_name, is_invalid FROM {}.category_setting", SCHEMA_NAME);
    let (valid_category_num, total_category_num) =
        match transaction.query(&category_get_stmt, &[]).await {
            Ok(res) => {
                let is_valid_superior_table = res.iter().any(|row| {
                    let table_name: &str = row.get("table_name");
                    let is_invalid: bool = row.get("is_invalid");
                    if is_invalid {return false}
                    table_name == superior_table
                });
                if !is_valid_superior_table {
                    error!("input superior table: '{}' doesn't exist in valid table", superior_table);
                    return Err(InvalidSettingException("Superior table name is invalid".to_string()));
                }
                info!("superior_table('{}') is valid.", superior_table);
                let mut valid: u64 = 0;
                let total = res.len() as u64;
                for row in &res {
                    let is_invalid: bool = row.get("is_invalid");
                    if !is_invalid {
                        valid += 1;
                    }
                }
                (valid, total)
            },
            Err(e) => {
                error!("get valid category count failed due to {}", e.to_string());
                return Err(QueryDataException("valid category table num cannot get from DB".to_string()))
            },
    };

    if valid_category_num >= 5 {
        error!("Category table is limit up to 5. Couldn't create new table.");
        return Err(ExceedCategoryTableException);
    }
    debug!("the number of the valid_category_tables is now {}. You can create more table.", valid_category_num);

    let new_category_table = format!("sub_category{}", total_category_num);
    let constraint_name = get_constraint_name(&new_category_table, superior_table);

    let create_table_stmt = format!("CREATE TABLE IF NOT EXISTS {0}.{1}
        (
            id serial PRIMARY KEY,
            name varchar not null,
            created_timestamp timestamp,
            created_user_id uuid not null,
            superior_category_id integer,
            is_deleted bool DEFAULT FALSE,
            CONSTRAINT {3} FOREIGN KEY (superior_category_id) REFERENCES {0}.{2} (id),
            FOREIGN KEY (created_user_id) REFERENCES {0}.users(id)
        )", SCHEMA_NAME, new_category_table, superior_table, constraint_name);

    if let Err(e) = transaction.execute(&create_table_stmt, &[]).await {
        error!("create table process failed due to [{:?}]", e);
        return Err(CreateTableException("Failed to create table".to_string()));
    };
    debug!("Create table on transaction complete.");

    let insert_setting_name_stmt = format!(
        "INSERT INTO {}.category_setting (table_name, display_name_en, display_name_ja, superior_table) VALUES ($1, $2, $3, $4)",
        SCHEMA_NAME);
    if let Err(e) = transaction.execute(
        &insert_setting_name_stmt,
        &[&new_category_table, &name_ja, &name_en, &superior_table]).await {
        error!("table setting insertion failed due to [{:?}]", e);
        return Err(CreateTableException("Failed to insert setting data".to_string()));
    };
    debug!("Setting insertion on transaction complete.");

    let trigger_name = format!("auto_created_timestamp_{}", new_category_table);
    let trigger_set_stmt = format!(
        "DROP TRIGGER IF EXISTS {0} on {1}.{2};
        CREATE TRIGGER {0}
        BEFORE INSERT ON {1}.{2}
        FOR EACH ROW
        EXECUTE FUNCTION {1}.insert_auto_timestamp()",
        trigger_name, SCHEMA_NAME, new_category_table);
    if let Err(e) = transaction.batch_execute(
        &trigger_set_stmt).await {
        error!("trigger setting failed due to [{:?}]", e);
        return Err(CreateTableException("Failed to set trigger".to_string()));
    };
    debug!("Trigger creation on transaction complete.");

    match transaction.commit().await {
        Ok(_) => {
            info!("Success to commit creating table named '{}'", new_category_table);
            info!("Success to commit inserting setting data. English name: '{}' and Japanese name: '{}'", name_en, name_ja);
            info!("Success to commit setting trigger named '{}'", trigger_name);

            info!("Complete the additional category table named '{}'", new_category_table);
            Ok(())
        },
        Err(e) => {
            error!("Failed to commit transaction due to {:?}", e);
            warn!("All creation process is revoked.");
            return Err(CreateTableException("Failed to commit transaction".to_string()));
        }
    }
}
