use actix_web::{Either, HttpRequest, HttpResponse};
use log::error;
use regex::Regex;
use serde::{Deserialize, Serialize};
use crate::data::connector::DBConnection;
use crate::utils::json::ResponseStatus::{BadRequest, InternalServerError};

pub const MAIL_PATTERN: &str = r"[A-Za-z0-9.+_-]+@[A-Za-z0-9.-]+\.[a-z0-9.]+";

#[derive(Serialize, Deserialize, Debug)]
pub struct HttpResponseBody<'a> {
    request_success: bool,
    data: Option<String>,
    failed_reason: Option<&'a str>,
    endpoint: &'a str,
}

impl <'a> HttpResponseBody<'a> {
    pub fn failed_new(reason: &'a str, endpoint: &'a str) -> Self {
        Self {
            request_success: false,
            data: None,
            failed_reason: Some(reason),
            endpoint,
        }
    }

    pub fn success_new<T: Serialize + Deserialize<'a>>(data: T, endpoint: &'a str) -> Self {
        Self {
            request_success: true,
            data: Some(serde_json::to_string(&data).unwrap()),
            failed_reason: None,
            endpoint,
        }
    }
}

pub(crate) fn get_access_info(request: &HttpRequest) -> String {
    let ip_addr = match request.peer_addr() {
        Some(ip) => ip.to_string(),
        None => "Unknown Source".to_string()
    };
    let uri = request.uri().to_string();
    let http_version = format!("{:?}",request.version());
    let method = request.method().to_string();

    format!("Access from {}(method: {}) to {} via {}", ip_addr, method, uri, http_version)
}

pub(crate) fn regex_email(email: &str, endpoint: &str) -> Either<(), HttpResponse> {
    match Regex::new(MAIL_PATTERN) {
        Ok(regex) => {
            if !regex.is_match(&email) {
                error!(
                    "Email format is ignored due to the format should be '{}' but the input '{}'",
                    MAIL_PATTERN, email);
                let response = HttpResponseBody::failed_new(
                    "Email address format is wrong. Please check your input",
                    endpoint
                );

                return Either::Right(BadRequest.json_response_builder(response));
            }
            Either::Left(())
        },
        Err(e) => {
            error!("Regex generation failed. This is system internal error. Please check the implementation.\n\
                    error message is [{}]", e.to_string());
            let response = HttpResponseBody::failed_new(
                "validation process went wrong. please contact the developer",
                endpoint
            );
            Either::Right(InternalServerError.json_response_builder(response))
        }
    }
}

pub(crate) async  fn get_db_connection(endpoint: &str) -> Either<DBConnection, HttpResponse> {
    match DBConnection::new().await {
        Ok(connection) => Either::Left(connection),
        Err(e) => {
            error!("DB Connection failed due to: {}", e.to_string());
            let response = HttpResponseBody::failed_new(
                "connection failure DB issue in backend side",
                endpoint
            );
            Either::Right(InternalServerError.json_response_builder(response))
        }
    }
}
