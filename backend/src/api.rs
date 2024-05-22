pub mod login;
pub mod register;
mod logout;
mod categories;

use actix_web::{Either, HttpRequest, Responder};
use actix_web::http::header::HeaderValue;
use log::{error, info};
use crate::data::category::get_all_categories;
use crate::utils::api::{get_access_info, get_db_connection, HttpResponseBody};
use crate::utils::json::json_response_builder;

pub const MAIL_PATTERN: &str = r"[A-Za-z0-9.+_-]+@[A-Za-z0-9.-]+\.[a-z0-9.]+";

pub async fn get_all(req: HttpRequest) -> impl Responder {
    info!("{}", get_access_info(&req));
    let endpoint_uri = req.uri().to_string();

    let conn = match get_db_connection(&endpoint_uri).await {
        Either::Left(conn) => conn,
        Either::Right(response) => return response
    };

    let all_categories = match get_all_categories(&conn).await {
        Ok(value) => value,
        Err(e) => {
            error!("Query for all categories failed due to: {}", e.to_string());
            let response = HttpResponseBody::failed_new(
                "cannot query all categories from DB",
                &endpoint_uri
            );
            return json_response_builder(response, false);
        }
    };

    let res = HttpResponseBody::success_new(all_categories, &endpoint_uri);
    json_response_builder(res, false)
}


