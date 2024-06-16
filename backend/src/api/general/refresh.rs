use actix_web::{Either, HttpRequest, Responder};
use actix_web::web::Json;
use log::{error, info};
use crate::errors::TimeKeeperError;
use crate::services::refresh_service::token_refresh;
use crate::types::api::refresh::{RefreshInput, RefreshResponse};
use crate::utils::api::{get_access_info, get_db_connection, HttpResponseBody};
use crate::utils::response::ResponseStatus::{InternalServerError, RequestOk, Unauthorized};

pub async fn refresh_endpoint(input: Json<RefreshInput>, req: HttpRequest) -> impl Responder {
    info!("{}", get_access_info(&req));

    let endpoint_uri = req.uri().to_string();

    let conn = match get_db_connection(&endpoint_uri).await {
        Either::Left(conn) => conn,
        Either::Right(response) => return response,
    };

    let refresh_token = input.refresh_token();

    let (username, access_token) = match token_refresh(refresh_token, &conn).await {
        Ok(username_token) => username_token,
        Err(e) => {
            error!("Failed to refresh the refresh token due to {:?}", e);
            let error_message = e.to_string();
            let response = HttpResponseBody::failed_new(
                &error_message,
                &endpoint_uri,
            );
            return match e {
                TimeKeeperError::RefreshTokenException(_) => {
                    Unauthorized.json_response_builder(response)
                },
                _ => {
                    InternalServerError.json_response_builder(response)
                }
            };
        }
    };

    let refresh_response = RefreshResponse::new(true, access_token.token(), username);
    let response = HttpResponseBody::success_new(
        refresh_response,
        &endpoint_uri,
    );

    RequestOk.json_response_builder(response)
}