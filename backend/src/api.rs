pub mod login;
pub mod register;

use actix_web::{get, HttpRequest, Responder};
use log::{error, info};
use crate::data::connector::DBConnection;
use crate::data::category::get_all_categories;
use crate::utils::api::{get_access_info, HttpResponseBody};
use crate::utils::json::json_response_builder;

const MAIL_PATTERN: &str = r"[A-Za-z0-9.+_-]+@[A-Za-z0-9.-]+\.[a-z0-9.]+";

#[get("/categories")]
async fn get_all(req: HttpRequest) -> impl Responder {
    info!("{}" ,get_access_info(req));
    let conn = match DBConnection::new().await {
        Ok(connection) => connection,
        Err(e) => {
            error!("DB Connection failed due to: {}", e.to_string());
            let response = HttpResponseBody::failed_new(
                "DB connection failed in backend side",
                "/categories"
            );
            return json_response_builder(response, false);
        }
    };

    let all_categories = match get_all_categories(&conn).await {
        Ok(value) => value,
        Err(e) => {
            error!("Query for all categories failed due to: {}", e.to_string());
            let response = HttpResponseBody::failed_new(
                "cannot query all categories from DB",
                "/categories"
            );
            return json_response_builder(response, false);
        }
    };

    let res = HttpResponseBody::success_new(all_categories, "/categories");
    json_response_builder(res, false)
}


