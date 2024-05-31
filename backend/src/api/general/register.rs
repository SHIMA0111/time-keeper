use actix_web::{Either, HttpRequest, Responder, web};
use log::{error, info};
use crate::data::authenticate::register;
use crate::utils::api::{get_access_info, get_db_connection, HttpResponseBody, regex_email};
use crate::utils::json::ResponseStatus::{Created, InternalServerError};
use crate::utils::types::register::{RegisterInput, RegisterResponse};

pub async fn register_new(register_input: web::Json<RegisterInput>, req: HttpRequest) -> impl Responder {
    info!("{}", get_access_info(&req));

    let endpoint_uri = req.uri().to_string();
    let email = register_input.email();

    if let Either::Right(response) = regex_email(&email, &endpoint_uri) {
        return response
    }

    let conn = match get_db_connection(&endpoint_uri).await {
        Either::Left(conn) => conn,
        Either::Right(response) => return response
    };

    let username = register_input.username();
    let password = register_input.password();

    match register(&email, &password, &username, &conn).await {
        Ok(user_id) => {
            info!("Register complete for user_id='{}'.", user_id);
            let register_info = RegisterResponse::new(true);
            let response = HttpResponseBody::success_new(
                register_info,
                &endpoint_uri
            );
            Created.json_response_builder(response)
        },
        Err(e) => {
            error!("Information register failed due to {}", e.to_string());
            let response = HttpResponseBody::failed_new(
                "Register process failed please try again later",
                &endpoint_uri,
            );
            InternalServerError.json_response_builder(response)
        }
    }
}