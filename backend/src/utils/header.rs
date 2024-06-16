use actix_web::http::header::AUTHORIZATION;
use actix_web::{Either, HttpRequest, HttpResponse};
use log::{error, info, warn};
use uuid::Uuid;
use crate::utils::api::HttpResponseBody;
use crate::utils::response::ResponseStatus::{BadRequest, Unauthorized};
use crate::utils::token::access_token_verify;
use crate::utils::uuid::uuid_from_string;

pub fn get_user_id(req: &HttpRequest) -> Either<Uuid, HttpResponse> {
    let endpoint_uri = req.uri().to_string();
    let mut user_id = req.headers()
        // 'x-user-id' is always added by middleware so this cannot be None if reachable this method.
        .get("x-user-id").unwrap().to_str().unwrap_or("").to_string();
    info!("Success to get user_id '{}'", user_id);

    if user_id.is_empty() {
        warn!("Not found user id from header");
        let authorization_token = match req.headers().get(AUTHORIZATION) {
            Some(authorization) => {
                let authorization_str = authorization.to_str();
                match authorization_str {
                    Ok(token) => token,
                    Err(e) => {
                        error!(
                            "Token services structured by out of UTF-8 so failed to parse by [{}]",
                            e.to_string()
                        );

                        let response =
                            HttpResponseBody::failed_new(
                                "Given invalid token",
                                &endpoint_uri);

                        return Either::Right(BadRequest.json_response_builder(response));
                    }
                }
            },
            None => {
                let response =
                    HttpResponseBody::failed_new("Invalid request", &endpoint_uri);
                return Either::Right(BadRequest.json_response_builder(response));
            }
        };

        let res = access_token_verify(authorization_token);

        match res {
            Ok(uid) => {
                info!("Get user_id success. Please note the middleware doesn't set this to header.");
                user_id = uid;
            },
            Err(_) => {
                error!("Access token invalid");
                let response = HttpResponseBody::failed_new("Access token invalid", &endpoint_uri);
                return Either::Right(Unauthorized.json_response_builder(response));
            }
        }
    };

    let user_id = match uuid_from_string(&user_id) {
        Ok(uuid_uid) => uuid_uid,
        Err(e) => {
            error!("Failed to convert the user id to Uuid due to {:?}", e);
            let response = HttpResponseBody::failed_new("user_id invalud", &endpoint_uri);
            return Either::Right(BadRequest.json_response_builder(response))
        }
    };

    Either::Left(user_id)
}