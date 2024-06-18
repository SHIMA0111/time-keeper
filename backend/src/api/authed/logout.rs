use actix_web::{Either, HttpRequest, Responder};
use actix_web::web::Json;
use log::{error, info};
use crate::services::logout_service::logout_service;
use crate::types::api::logout::LogoutInput;
use crate::utils::api::{get_access_info, get_db_connection, HttpResponseBody};
use crate::utils::response::ResponseStatus::{InternalServerError, RequestOk};

pub async fn logout_endpoint(input: Json<LogoutInput>, req: HttpRequest) -> impl Responder {
    info!("{}", get_access_info(&req));

    let endpoint_uri = req.uri().to_string();
    let refresh_token = input.refresh_token();

    let conn = match get_db_connection(&endpoint_uri).await {
        Either::Left(conn) => conn,
        Either::Right(response) => {
            error!("Access DB failed.");
            return response;
        },
    };

    if let Err(e) = logout_service(&refresh_token, &conn).await {
        error!("disable refresh_token failed due to {:?}", e);
        let error_message = e.to_string();
        let response = HttpResponseBody::failed_new(
            &error_message,
            &endpoint_uri,
        );
        return InternalServerError.json_response_builder(response);
    };
    info!("Complete disable refresh_token for logout.");

    let response = HttpResponseBody::success_new("", &endpoint_uri);
    info!("Complete logout process");
    RequestOk.json_response_builder(response)
}