use actix_web::{Either, HttpRequest, Responder};
use actix_web::web::Json;
use log::{error, info};
use crate::utils::api::{get_access_info, get_db_connection, HttpResponseBody};
use crate::utils::error::TimeKeeperError::{DBConnectionException, RefreshTokenExpiredException, RefreshTokenInvalidException};
use crate::utils::response::ResponseStatus::{InternalServerError, RequestOk, ServiceUnavailable, Unauthorized};
use crate::utils::token::{refresh_token_verify, token_generate};
use crate::utils::types::refresh::{RefreshInput, RefreshResponse};

pub async fn refresh(refresh_info: Json<RefreshInput>, req: HttpRequest) -> impl Responder {
    info!("{}", get_access_info(&req));

    let endpoint_uri = req.uri().to_string();

    let conn = match get_db_connection(&endpoint_uri).await {
        Either::Left(conn) => conn,
        Either::Right(response) => return response,
    };

    let refresh_token = refresh_info.refresh_token();

    let (user_id, username) = match refresh_token_verify(&refresh_token, &conn).await {
        Ok(user_id_and_name) => user_id_and_name,
        Err(e) => {
            let error_message = e.to_string();
            let response = HttpResponseBody::failed_new(
                &error_message, &endpoint_uri
            );

            return match e {
                DBConnectionException(_) => {
                    InternalServerError.json_response_builder(response)
                },
                RefreshTokenInvalidException(_) | RefreshTokenExpiredException(_) => {
                    Unauthorized.json_response_builder(response)
                },
                _ => ServiceUnavailable.json_response_builder(response),
            }
        }
    };

    info!("Start to generate new access token for '{}'", user_id);
    let access_token = match token_generate(&user_id, false, Some(&conn)).await {
        Ok(token) => token,
        Err(e) => {
            let error_message = e.to_string();
            error!("Generating access token failed due to {}", error_message);
            let response = HttpResponseBody::failed_new(
                &error_message, &endpoint_uri,
            );
            return InternalServerError.json_response_builder(response);
        }
    };
    info!("Success to authentication and generate access token for '{}'", user_id);

    let refresh_response = RefreshResponse::new(true, access_token, username);
    let response = HttpResponseBody::success_new(
        refresh_response,
        &endpoint_uri,
    );

    RequestOk.json_response_builder(response)
}