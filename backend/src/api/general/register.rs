use actix_web::{Either, HttpRequest, Responder, web};
use log::{error, info};
use crate::services::register_service::user_register;
use crate::types::api::register::RegisterResponse;
use crate::types::db::user::CreateUser;
use crate::utils::api::{get_access_info, get_db_connection, HttpResponseBody};
use crate::utils::regex::regex_email;
use crate::utils::response::ResponseStatus::{Created, InternalServerError};

pub async fn register_endpoint(register_input: web::Json<CreateUser>, req: HttpRequest) -> impl Responder {
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

    match user_register(&register_input, &conn).await {
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
            error!("create user process failed due to {:?}", e);
            let error_message = e.to_string();
            let response = HttpResponseBody::failed_new(
                &error_message,
                &endpoint_uri,
            );
            InternalServerError.json_response_builder(response)
        }
    }
}