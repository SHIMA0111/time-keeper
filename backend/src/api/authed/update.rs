use actix_web::{Either, HttpRequest, Responder};
use actix_web::web::Json;
use log::{error, info};
use crate::services::update_service::update_user_service;
use crate::types::api::update::UserUpdateInput;
use crate::utils::api::{get_access_info, get_db_connection, HttpResponseBody};
use crate::utils::header::get_user_id;
use crate::utils::regex::regex_email;
use crate::utils::response::ResponseStatus::{InternalServerError, RequestOk};

pub async fn user_update_endpoint(input: Json<UserUpdateInput>, req: HttpRequest) -> impl Responder {
    info!("{}", get_access_info(&req));

    let endpoint_uri = req.uri().to_string();

    let user_id = match get_user_id(&req) {
        Either::Left(uid) => uid,
        Either::Right(res) => return res,
    };
    let db_connection = match get_db_connection(&endpoint_uri).await {
        Either::Left(conn) => conn,
        Either::Right(res) => return res,
    };
    let new_email = input.email();
    if let Either::Right(failed_response) = regex_email(&new_email, &endpoint_uri) {
        return failed_response;
    }
    let new_username = input.username();

    match update_user_service(user_id, &new_username, &new_email, &db_connection).await {
        Ok(_) => {
            let res = HttpResponseBody::success_new("", &endpoint_uri);
            RequestOk.json_response_builder(res)
        },
        Err(e) => {
            error!("Failed to update user data by {:?}", e);
            let error_message = e.to_string();
            let res = HttpResponseBody::failed_new(
                &error_message,
                &endpoint_uri,
            );
            InternalServerError.json_response_builder(res)
        }
    }
}