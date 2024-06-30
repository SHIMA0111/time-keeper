use std::collections::{HashMap};
use futures_util::future::join_all;
use log::error;
use tokio_postgres::Transaction;
use uuid::Uuid;
use crate::db::DBConnection;
use crate::errors::TimeKeeperError::DBCURDException;
use crate::errors::TimeKeeperResult;
use crate::sql::get::get_category::{get_specified_category};
use crate::sql::get::get_table_setting::get_validate_table_setting;
use crate::sql::insert::create_category::{create_category_transaction};
use crate::sql::update::update_category_setting::{remove_category, update_category_setting};
use crate::types::api::category::CategoryInput;
use crate::types::db::category::{Category, CreateCategory};

pub async fn get_category_service(user_id: Uuid, conn: &DBConnection) -> TimeKeeperResult<Vec<Category>> {
    let valid_tables = get_validate_table_setting(user_id, conn).await?;

    let categories =
        get_specified_category(user_id, &valid_tables, conn).await?;
    Ok(categories)
}

pub async fn update_create_category_service(categories: &[&CategoryInput],
                                            user_id: Uuid,
                                            conn: &mut DBConnection) -> TimeKeeperResult<Vec<Category>> {
    let mut new_categories = Vec::new();
    let mut exist_categories = Vec::new();
    let mut remove_categories = Vec::new();

    for &category in categories {
        let category_id = category.dummy_id();
        match Uuid::parse_str(&category_id) {
            Ok(_) => {
                if category.category_name().is_empty() {
                    remove_categories.push(category.clone())
                }
                else {
                    exist_categories.push(category.clone())
                }
            },
            Err(_) => new_categories.push(category.clone()),
        }
    };

    let transaction = conn.transaction().await?;
    let dummy_corresponding_id_table =
        create_category_service(&new_categories, user_id, &transaction).await?;
    update_category_service(&exist_categories, dummy_corresponding_id_table, &transaction).await?;
    soft_delete_category_service(&remove_categories, &transaction).await?;

    let commit_res = transaction.commit().await;
    if let Err(e) = commit_res {
        error!("Failed to update transaction by {:?}", e);
        return Err(DBCURDException("Failed to commit update category setting".to_string()));
    };

    get_category_service(user_id, conn).await
}

async fn update_category_service(existing_categories: &[CategoryInput],
                                 dummy_corresponding_id_table: HashMap<String, Uuid>,
                                 transaction: &Transaction<'_>) -> TimeKeeperResult<()> {
    let mut update_task_vec = Vec::new();
    for category in existing_categories {
        let id_str = category.dummy_id();
        let id = Uuid::parse_str(&id_str).unwrap();
        let superior_id_str = category.superior_id();
        let superior_id = match superior_id_str {
            Some(id) => {
                let uid_result = Uuid::parse_str(&id);
                let uid = match uid_result {
                    Ok(uid) => uid,
                    Err(_) => dummy_corresponding_id_table.get(&id).unwrap().clone(),
                };
                Some(uid)
            },
            None => None,
        };
        let category_up =
            update_category_setting(id,
                                    category.category_name(),
                                    category.table_name(),
                                    superior_id,
                                    true,
                                    transaction);
        update_task_vec.push(category_up);
    };

    let results = join_all(update_task_vec).await;
    for result in results {
        result?;
    }

    Ok(())
}

async fn create_category_service(new_categories: &[CategoryInput],
                                 user_id: Uuid,
                                 transaction: &Transaction<'_>) -> TimeKeeperResult<HashMap<String, Uuid>> {
    let mut correspond_actual_id_table = HashMap::<String, Uuid>::new();

    let mut non_new_dep = Vec::new();
    let mut new_dep = Vec::new();

    let _ = new_categories
        .iter()
        .map(|category| {
            if category.superior_id().is_none() {
                non_new_dep.push(category);
                return;
            }
            let superior_id = category.superior_id().unwrap();
            let depend_uuid = Uuid::parse_str(&superior_id);
            if depend_uuid.is_err() {
                new_dep.push(category);
            }
            else {
                non_new_dep.push(category);
            }
        }).collect::<Vec<_>>();

    let non_depend_new_category =
        non_new_dep
            .iter()
            .map(|independent_category| {
                let superior_id = independent_category.superior_id();
                let superior_uuid_id = if superior_id.is_none() {
                    None
                }
                else {
                    let superior_uuid = Uuid::parse_str(&(superior_id.unwrap())).unwrap();
                    Some(superior_uuid)
                };
                let new_category = CreateCategory::new(
                    independent_category.table_name(),
                    independent_category.category_name(),
                    superior_uuid_id,
                    user_id
                );

                correspond_actual_id_table.insert(independent_category.dummy_id(), new_category.id());
                new_category
            }).collect::<Vec<_>>();

    new_dep
        .sort_by(|a, b| a.table_name().cmp(&b.table_name()));

    let depend_new_category = new_dep
        .iter()
        .map(|category| {
            let superior_uuid_id =
                correspond_actual_id_table.get(&category.superior_id().unwrap()).unwrap().clone();
            let create_category_data = CreateCategory::new(
                category.table_name(),
                category.category_name(),
                Some(superior_uuid_id),
                user_id
            );
            correspond_actual_id_table.insert(category.dummy_id(), create_category_data.id());
            create_category_data
        }).collect::<Vec<_>>();

    let mut non_deps_create_category_tasks = Vec::new();
    for no_deps_category in &non_depend_new_category {
        let task = create_category_transaction(no_deps_category, transaction);
        non_deps_create_category_tasks.push(task);
    }
    let results = join_all(non_deps_create_category_tasks).await;
    for result in results {
        result?;
    }

    for deps_new_category in &depend_new_category {
        create_category_transaction(deps_new_category, transaction).await?;
    }


    Ok(correspond_actual_id_table)
}

async fn soft_delete_category_service(remove_categories: &[CategoryInput],
                                      transaction: &Transaction<'_>) -> TimeKeeperResult<()> {
    let mut remove_tasks = Vec::new();

    for remove_category_data in remove_categories {
        let category_id = Uuid::parse_str(&remove_category_data.dummy_id()).unwrap();
        let table_name = remove_category_data.table_name();

        let task = remove_category(category_id, table_name, transaction);
        remove_tasks.push(task);
    }

    let results = join_all(remove_tasks).await;
    for result in results {
        result?;
    }

    Ok(())
}
