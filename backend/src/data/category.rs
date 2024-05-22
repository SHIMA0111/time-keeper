use serde::{Deserialize, Serialize};

use crate::data::connector::DBConnection;
use crate::utils::api::{Category, Option1, Option2, Subcategory};
use crate::utils::types::PGResult;

async fn get_categories(connector: &DBConnection) -> PGResult<Vec<Category>> {
    let category_rows = connector.client().query(
        "SELECT * FROM time_schema.categories",
        &[]).await?;

    let categories = category_rows.iter().map(|category_row| {
        let id = category_row.get("id");
        let category = category_row.get("category");
        let created_timestamp = category_row.get("created_timestamp");
        let is_deleted = category_row.get("is_deleted");

        Category::new(id, category, created_timestamp, is_deleted)
    }).collect::<Vec<Category>>();

    Ok(categories)
}

pub async fn get_subcategories(connector: &DBConnection, category_id: Option<u32>) -> PGResult<Vec<Subcategory>> {
    let subcategory_rows = match category_id {
        Some(id) => connector.client()
            .query(
                "SELECT * FROM time_schema.subcategories WHERE category_id=$1 or category_id IS NULL",
                &[&id]).await?,
        None => connector.client()
            .query("SELECT * FROM time_schema.subcategories", &[]).await?
    };

    let subcategories = subcategory_rows.iter().map(|subcategory_row| {
        let id = subcategory_row.get("id");
        let subcategory = subcategory_row.get("subcategory");
        let category_id = subcategory_row.get("category_id");
        let created_timestamp = subcategory_row.get("created_timestamp");
        let is_deleted = subcategory_row.get("is_deleted");

        Subcategory::new(id, subcategory, category_id, created_timestamp, is_deleted)
    }).collect::<Vec<Subcategory>>();

    Ok(subcategories)
}

pub async fn get_option1(connector: &DBConnection, subcategory_id: Option<u32>) -> PGResult<Vec<Option1>> {
    let option1_rows = match subcategory_id {
        Some(id) => connector.client()
            .query(
                "SELECT * FROM time_schema.option1 WHERE subcategory_id=$1 or subcategory_id IS NULL",
                &[&id]).await?,
        None => connector.client()
            .query("SELECT * FROM time_schema.option1", &[]).await?
    };

    let option1 = option1_rows.iter().map(|option1_row| {
        let id = option1_row.get("id");
        let option1 = option1_row.get("option1");
        let subcategory_id = option1_row.get("subcategory_id");
        let created_timestamp = option1_row.get("created_timestamp");
        let is_deleted = option1_row.get("is_deleted");

        Option1::new(id, option1, subcategory_id, created_timestamp, is_deleted)
    }).collect::<Vec<Option1>>();

    Ok(option1)
}

pub async fn get_option2(connector: &DBConnection, option1_id: Option<u32>) -> PGResult<Vec<Option2>> {
    let option2_rows = match option1_id {
        Some(id) => connector.client()
            .query(
                "SELECT * FROM time_schema.option2 WHERE option1_id=$1 or option1_id IS NULL",
                &[&id]).await?,
        None => connector.client()
            .query("SELECT * FROM time_schema.option2", &[]).await?
    };

    let option2 = option2_rows.iter().map(|option2_row| {
        let id = option2_row.get("id");
        let option2 = option2_row.get("option2");
        let option1_id = option2_row.get("option1_id");
        let created_timestamp = option2_row.get("created_timestamp");
        let is_deleted = option2_row.get("is_deleted");

        Option2::new(id, option2, option1_id, created_timestamp, is_deleted)
    }).collect::<Vec<Option2>>();

    Ok(option2)
}

#[derive(Serialize, Deserialize, Debug)]
pub struct AllCategories {
    categories: Vec<Category>,
    subcategories: Vec<Subcategory>,
    option1: Vec<Option1>,
    option2: Vec<Option2>,
}

pub async fn get_all_categories(connector: &DBConnection) -> PGResult<AllCategories> {
    let categories = get_categories(connector).await?;
    let subcategories = get_subcategories(connector, None).await?;
    let option1 = get_option1(connector, None).await?;
    let option2 = get_option2(connector, None).await?;

    let res = AllCategories {
        categories,
        subcategories,
        option1,
        option2,
    };

    Ok(res)
}
