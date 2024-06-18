use actix_web::{Either, HttpRequest, Responder};
use actix_web::web::Json;
use log::{error, info};
use crate::errors::TimeKeeperError;
use crate::services::login_service::login_service;
use crate::types::api::login::{LoginInput, LoginResponse};
use crate::utils::api::{get_access_info, get_db_connection, HttpResponseBody};
use crate::utils::regex::regex_email;
use crate::utils::response::ResponseStatus::{InternalServerError, RequestOk, Unauthorized};

pub async fn login_endpoint(input: Json<LoginInput>, req: HttpRequest) -> impl Responder {
    info!("{}", get_access_info(&req));

    let endpoint_uri = req.uri().to_string();
    let email = input.email();
    let password = input.password();

    if let Either::Right(failed_response) = regex_email(&email, &endpoint_uri) {
        return failed_response
    };

    let conn = match get_db_connection(&endpoint_uri).await {
        Either::Left(conn) => conn,
        Either::Right(response) => return response
    };

    let (access_token, refresh_token, user_id, username) =
        match login_service(&email, &password, &conn).await {
            Ok(user_id_and_name) => user_id_and_name,
            Err(e) => {
                error!("Failed to authenticate user {:?}", e);
                let error_message = e.to_string();
                let response = HttpResponseBody::failed_new(
                    &error_message,
                    &endpoint_uri
                );
                return match e {
                    TimeKeeperError::UserAuthenticationException(_) => {
                        Unauthorized.json_response_builder(response)
                    },
                    _ => {
                        InternalServerError.json_response_builder(response)
                    }
                };
            }
        };

    info!("Login process success for {}", user_id);
    let login_info = LoginResponse::new(
        true,
        access_token.token(),
        refresh_token.token(),
        username
    );

    let response = HttpResponseBody::success_new(login_info, &endpoint_uri);
    RequestOk.json_response_builder(response)
}