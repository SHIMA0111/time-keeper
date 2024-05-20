use actix_web::{HttpRequest, post, Responder};
use actix_web::web::Json;
use log::{error, info};
use regex::Regex;
use crate::api::MAIL_PATTERN;
use crate::data::authenticate::authentication;
use crate::data::connector::DBConnection;
use crate::utils::api::{get_access_info, HttpResponseBody, LoginInput, LoginResponse};
use crate::utils::json::json_response_builder;
use crate::utils::token::token_generate;

#[post("/login")]
async fn login_auth(auth_info: Json<LoginInput>, req: HttpRequest) -> impl Responder {
    info!("{}" ,get_access_info(req));

    let re = match Regex::new(MAIL_PATTERN) {
        Ok(regex) => regex,
        Err(e) => {
            error!("Regex generation failed. This is system internal error. Please check the implementation.\n\
            error message is [{}]", e.to_string());
            let response = HttpResponseBody::failed_new(
                "validation process went wrong. please contact the developer",
                "/login"
            );
            return json_response_builder(response, false);
        }
    };

    let conn = match DBConnection::new().await {
        Ok(connection) => connection,
        Err(e) => {
            error!("DB Connection failed due to: {}", e.to_string());
            let response = HttpResponseBody::failed_new(
                "connection failure in backend side",
                "/login"
            );
            return json_response_builder(response, false);
        }
    };

    let email = auth_info.email();
    let password = auth_info.password();

    if !re.is_match(&email) {
        error!(
            "Email format is ignored due to the format should be '{}' but the input '{}'",
            MAIL_PATTERN, email);
        let response = HttpResponseBody::success_new(
            "Email address format is wrong. Please check your input",
            "/login"
        );

        return json_response_builder(response, false);
    }

    let user_id = match authentication(&email, &password, &conn).await {
        Ok(id) => id,
        Err(e) => {
            error!("Failed to authenticate user ({})", e.to_string());
            let response = HttpResponseBody::failed_new(
                "User authentication failed. Please try later.",
                "/login"
            );
            return json_response_builder(response, false);
        }
    };

    if user_id == "" {
        info!("Login failed by invalid password or email address");
        let login_info = LoginResponse::new(false, "".to_string(), "".to_string());
        let response = HttpResponseBody::success_new(login_info, "/login");
        return json_response_builder(response, true);
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
                "/login"
            );
            return json_response_builder(response, false);
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
                "/login"
            );
            return json_response_builder(response, false);
        }
    };

    info!("Login process success for {}", user_id);
    let login_info = LoginResponse::new(true, access_token, refresh_token);

    let response = HttpResponseBody::success_new(login_info, "/login");
    json_response_builder(response, false)
}