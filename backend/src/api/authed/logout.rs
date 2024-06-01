use actix_web::{Either, HttpRequest, Responder};
use actix_web::http::header::AUTHORIZATION;
use log::{error, info, warn};
use crate::utils::api::{get_access_info, get_db_connection, HttpResponseBody};
use crate::utils::error::AuthenticateError;
use crate::utils::json::ResponseStatus::{BadRequest, InternalServerError, RequestOk, Unauthorized};
use crate::utils::sql::delete::delete_refresh_token;
use crate::utils::token::access_token_verify;

pub async fn logout_delete_token(req: HttpRequest) -> impl Responder {
    info!("{}", get_access_info(&req));

    let endpoint_uri = req.uri().to_string();

    let mut user_id = req.headers()
        // 'x-user-id' is always added by middleware so this cannot be None if reachable this method.
        .get("x-user-id").unwrap().to_str().unwrap_or("").to_string();
    info!("Logout process for '{}' started", user_id);

    if user_id.is_empty() {
        warn!("Not found user id from header");
        let authorization_token = match req.headers().get(AUTHORIZATION) {
            Some(authorization) => {
                let authorization_str = authorization.to_str();
                match authorization_str {
                    Ok(token) => token,
                    Err(e) => {
                        error!(
                            "Token data structured by out of UTF-8 so failed to parse by [{}]",
                            e.to_string()
                        );

                        let response =
                            HttpResponseBody::failed_new(
                                "Given invalid token",
                                &endpoint_uri);

                        return BadRequest.json_response_builder(response);
                    }
                }
            },
            None => {
                let response =
                    HttpResponseBody::failed_new("Invalid request", &endpoint_uri);
                return BadRequest.json_response_builder(response);
            }
        };

        let res = access_token_verify(authorization_token, false);

        match res {
            Ok(uid) => {
                info!("Get user_id success. Please note the middleware doesn't set this to header.");
                user_id = uid;
            },
            Err(e) => {
                return match e {
                    AuthenticateError::AccessTokenExpiredException(e) => {
                        info!("{}", e);
                        let response = HttpResponseBody::failed_new("Access token expired", &endpoint_uri);
                        Unauthorized.json_response_builder(response)
                    },
                    _ => {
                        error!("Access token invalid by [{}]", e.to_string());
                        let response = HttpResponseBody::failed_new("Access token invalid", &endpoint_uri);
                        BadRequest.json_response_builder(response)
                    }
                };
            }
        }
    }

    let conn = match get_db_connection(&endpoint_uri).await {
        Either::Left(conn) => conn,
        Either::Right(response) => {
            error!("Access DB failed.");
            return response
        },
    };
    info!("Success DB connection");

    let result = delete_refresh_token(&user_id, &conn).await;

    if let Err(e) = result {
        error!("Delete refresh token by user logout failed. Because of [{}]", e.to_string());
        let response = HttpResponseBody::failed_new(
            "Failed to delete refresh token. However it will invalidate after 1 hour.",
            &endpoint_uri,
        );
        return InternalServerError.json_response_builder(response);
    };
    info!("Delete refresh token success.");
    info!("Complete logout process");

    let response = HttpResponseBody::success_new("", &endpoint_uri);
    RequestOk.json_response_builder(response)
}