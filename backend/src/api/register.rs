use actix_web::{HttpRequest, post, Responder, web};
use log::{error, info};
use regex::Regex;
use crate::api::MAIL_PATTERN;
use crate::data::authenticate::register;
use crate::data::connector::DBConnection;
use crate::utils::api::{get_access_info, HttpResponseBody, RegisterInput, RegisterResponse};
use crate::utils::json::json_response_builder;

#[post("/register")]
async fn register_new(register_input: web::Json<RegisterInput>, req: HttpRequest) -> impl Responder {
    info!("{}", get_access_info(req));

    let re = match Regex::new(MAIL_PATTERN) {
        Ok(regex) => regex,
        Err(e) => {
            error!("Regex generation failed. This is system internal error. Please check the implementation.\n\
            error message is [{}]", e.to_string());
            let response = HttpResponseBody::failed_new(
                "validation process went wrong. please contact the developer",
                "/register"
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
                "/register"
            );
            return json_response_builder(response, false);
        }
    };

    let email = register_input.email();
    let username = register_input.username();
    let password = register_input.password();

    if !re.is_match(&email) {
        error!(
            "Email format is ignored due to the format should be '{}' but the input '{}'",
            MAIL_PATTERN, email);
        let response = HttpResponseBody::success_new(
            "Email address format is wrong. Please check your input",
            "/register"
        );

        return json_response_builder(response, false);
    }

    match register(&email, &password, &username, &conn).await {
        Ok(_) => {
            info!("Register complete.");
            let register_info = RegisterResponse::new(true);
            let response = HttpResponseBody::success_new(
                register_info,
                "/register"
            );
            json_response_builder(response, false)
        },
        Err(e) => {
            error!("Information register failed due to {}", e.to_string());
            let response = HttpResponseBody::failed_new(
                "Register process failed please try again later",
                "/register",
            );
            json_response_builder(response, false)
        }
    }
}