use actix_web::{get, HttpRequest, post, Responder};
use actix_web::web::Json;
use log::{error, info};
use regex::Regex;
use crate::data::authenticate::authentication;
use crate::data::connector::DBConnection;
use crate::data::category::get_all_categories;
use crate::utils::api::{get_access_info, HttpResponseBody, LoginInput, LoginResponse};
use crate::utils::json::json_response_builder;
use crate::utils::token::token_generate;

const MAIL_PATTERN: &str = r"[A-Za-z0-9.+_-]+@[A-Za-z0-9.-]+\.[a-z0-9.]+";

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
        Err(_) => {
            let response = HttpResponseBody::failed_new(
                "Internal Server Error!",
                "/login"
            );
            return json_response_builder(response, false);
        }
    };

    if user_id == "" {
        let login_info = LoginResponse::new(false, "".to_string(), "".to_string());
        let response = HttpResponseBody::success_new(login_info, "/login");
        return json_response_builder(response, true);
    }

    let access_token = match token_generate(&user_id, false, None).await {
        Ok(access_token) => access_token,
        Err(e) => {
            error!("Access token generation failed due to [{}]", e.to_string());
            let response = HttpResponseBody::failed_new(
                "Internal Server Error!",
                "/login"
            );
            return json_response_builder(response, false);
        }
    };
    let refresh_token = match token_generate(&user_id, true, Some(&conn)).await {
        Ok(refresh_token) => refresh_token,
        Err(e) => {
            error!("Refresh token generation failed due to [{}]", e.to_string());
            let response = HttpResponseBody::failed_new(
                "Internal Server Error!",
                "/login"
            );
            return json_response_builder(response, false);
        }
    };

    let login_info = LoginResponse::new(true, access_token, refresh_token);

    let response = HttpResponseBody::success_new(login_info, "/login");
    json_response_builder(response, false)
}

#[get("/categories")]
async fn get_all(req: HttpRequest) -> impl Responder {
    info!("{}" ,get_access_info(req));
    let conn = match DBConnection::new().await {
        Ok(connection) => connection,
        Err(e) => {
            error!("DB Connection failed due to: {}", e.to_string());
            let response = HttpResponseBody::failed_new(
                "DB connection failed in backend side",
                "/categories"
            );
            return json_response_builder(response, false);
        }
    };

    let all_categories = match get_all_categories(&conn).await {
        Ok(value) => value,
        Err(e) => {
            error!("Query for all categories failed due to: {}", e.to_string());
            let response = HttpResponseBody::failed_new(
                "cannot query all categories from DB",
                "/categories"
            );
            return json_response_builder(response, false);
        }
    };

    let res = HttpResponseBody::success_new(all_categories, "/categories");
    json_response_builder(res, false)
}


