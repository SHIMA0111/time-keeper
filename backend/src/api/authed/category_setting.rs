use actix_web::{Either, HttpRequest, Responder};
use log::{error, info};
use crate::utils::api::{get_access_info, get_db_connection, HttpResponseBody};
use crate::utils::response::ResponseStatus::{InternalServerError, RequestOk};
use crate::utils::sql::get::get_category_setting;
use crate::utils::types::category_setting::{CategoryName, CategoryResponse};

pub async fn category_setting(req: HttpRequest) -> impl Responder {
    info!("{}", get_access_info(&req));

    let endpoint_uri = req.uri().to_string();
    let conn = match get_db_connection(&endpoint_uri).await {
        Either::Left(conn) => conn,
        Either::Right(response) => {
            error!("Access DB failed.");
            return response;
        }
    };

    let result = get_category_setting(&conn).await;

    if let Err(e) = result {
        error!("Getting category setting failed Because of [{}]", e.to_string());
        let response = HttpResponseBody::failed_new(
            "Failed to get category setting",
            &endpoint_uri,
        );
        return InternalServerError.json_response_builder(response);
    }

    let mut rows = result.unwrap();

    let mut name_vec = Vec::new();

    for row in &rows {
        let table_name: String = row.get("table_name");
        let display_name: String = row.get("display_name");
        let superior_table: String = row.get("superior_table");
        let names = CategoryName::new(table_name, display_name);
        name_vec.push(names);
    }

    let category_data = match CategoryResponse::new(&name_vec) {
        Ok(category_data) => category_data,
        Err(e) => {
            error!("Failed to generate category_data due to [{}]", e.to_string());
            let response = HttpResponseBody::failed_new(
                "Failed to generate category setting response",
                &endpoint_uri
            );
            return InternalServerError.json_response_builder(response);
        }
    };

    let response = HttpResponseBody::success_new(category_data, &endpoint_uri);

    return RequestOk.json_response_builder(response);
}