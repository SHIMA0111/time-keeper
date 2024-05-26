use actix_web::{Either, HttpRequest, Responder};
use actix_web::web::Json;
use log::{error, info};
use crate::data::authenticate::authentication;
use crate::utils::api::{get_access_info, get_db_connection, HttpResponseBody, LoginInput, LoginResponse, regex_email};
use crate::utils::json::ResponseStatus::{InternalServerError, RequestOk, Unauthorized};
use crate::utils::token::token_generate;

pub async fn login_auth(auth_info: Json<LoginInput>, req: HttpRequest) -> impl Responder {
    info!("{}" ,get_access_info(&req));

    let endpoint_uri = req.uri().to_string();
    let email = auth_info.email();

    if let Either::Right(val) = regex_email(&email, &endpoint_uri) {
        return val
    };

    let conn = match get_db_connection(&endpoint_uri).await {
        Either::Left(conn) => conn,
        Either::Right(response) => return response
    };

    let email = auth_info.email();
    let password = auth_info.password();

    let user_id = match authentication(&email, &password, &conn).await {
        Ok(id) => id,
        Err(e) => {
            error!("Failed to authenticate user ({})", e.to_string());
            let response = HttpResponseBody::failed_new(
                "User authentication failed. Please try later.",
                &endpoint_uri
            );
            return InternalServerError.json_response_builder(response);
        }
    };

    if user_id == "" {
        info!("Login failed by invalid password or email address");
        let login_info = LoginResponse::new(false, "".to_string(), "".to_string());
        let response = HttpResponseBody::success_new(login_info, &endpoint_uri);
        return Unauthorized.json_response_builder(response);
    }

    let access_token = match token_generate(&user_id, false, None).await {
        Ok(access_token) => {
            info!("Access token generated for {}", user_id);
            access_token
        },
        Err(e) => {
            error!("Access token generation failed due to [{}]", e.to_string());
            let response = HttpResponseBody::failed_new(
                "Authenticate token process failed. Please try later.",
                &endpoint_uri
            );
            return InternalServerError.json_response_builder(response);
        }
    };
    let refresh_token = match token_generate(&user_id, true, Some(&conn)).await {
        Ok(refresh_token) => {
            info!("Refresh token generated for {}", user_id);
            refresh_token
        },
        Err(e) => {
            error!("Refresh token generation failed due to [{}]", e.to_string());
            let response = HttpResponseBody::failed_new(
                "Authenticate token process failed. Please try later.",
                &endpoint_uri
            );
            return InternalServerError.json_response_builder(response);
        }
    };

    info!("Login process success for {}", user_id);
    let login_info = LoginResponse::new(true, access_token, refresh_token);

    let response = HttpResponseBody::success_new(login_info, &endpoint_uri);
    RequestOk.json_response_builder(response)
}