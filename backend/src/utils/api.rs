use actix_web::{Either, HttpRequest, HttpResponse};
use chrono::NaiveDateTime;
use log::error;
use regex::Regex;
use serde::{Deserialize, Serialize};
use crate::api::MAIL_PATTERN;
use crate::data::connector::DBConnection;
use crate::utils::json::ResponseStatus::{BadRequest, InternalServerError};

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

#[derive(Deserialize, Serialize, Debug)]
pub struct Category {
    id: i32,
    category: String,
    created_timestamp: NaiveDateTime,
    is_deleted: bool,
}

impl Category {
    pub fn new(id: i32,
               category: String,
               created_timestamp: NaiveDateTime,
               is_deleted: bool) -> Self {
        Self {
            id,
            category,
            created_timestamp,
            is_deleted,
        }
    }
}

#[derive(Deserialize, Serialize, Debug)]
pub struct Subcategory {
    id: i32,
    subcategory: String,
    category_id: Option<i32>,
    created_timestamp: NaiveDateTime,
    is_deleted: bool,
}

impl Subcategory {
    pub fn new(id: i32,
               subcategory: String,
               category_id: Option<i32>,
               created_timestamp: NaiveDateTime,
               is_deleted: bool) -> Self {
        Self {
            id,
            subcategory,
            category_id,
            created_timestamp,
            is_deleted,
        }
    }
}

#[derive(Deserialize, Serialize, Debug)]
pub struct Option1 {
    id: i32,
    option1: String,
    subcategory_id: Option<i32>,
    created_timestamp: NaiveDateTime,
    is_deleted: bool,
}

impl Option1 {
    pub fn new(id: i32,
               option1: String,
               subcategory_id: Option<i32>,
               created_timestamp: NaiveDateTime,
               is_deleted: bool) -> Self {
        Self {
            id,
            option1,
            subcategory_id,
            created_timestamp,
            is_deleted,
        }
    }
}

#[derive(Deserialize, Serialize, Debug)]
pub struct Option2 {
    id: i32,
    option2: String,
    option1_id: Option<i32>,
    created_timestamp: NaiveDateTime,
    is_deleted: bool,
}

impl Option2 {
    pub fn new(id: i32,
               option2: String,
               option1_id: Option<i32>,
               created_timestamp: NaiveDateTime,
               is_deleted: bool) -> Self {
        Self {
            id,
            option2,
            option1_id,
            created_timestamp,
            is_deleted,
        }
    }
}

#[derive(Serialize, Deserialize, Debug)]
pub struct LoginInput {
    user_email: String,
    password: String
}

impl LoginInput {
    pub(crate) fn email(&self) -> String {
        self.user_email.to_string()
    }

    pub(crate) fn password(&self) -> String {
        self.password.to_string()
    }
}

#[derive(Serialize, Deserialize, Debug)]
pub struct LoginResponse {
    authenticated: bool,
    access_token: String,
    refresh_token: String,
    username: String,
}

impl LoginResponse {
    pub fn new(authenticated: bool, access_token: String, refresh_token: String, username: String) -> Self {
        Self {
            authenticated,
            access_token,
            refresh_token,
            username,
        }
    }
}

#[derive(Serialize, Deserialize, Debug)]
pub struct RegisterInput {
    username: String,
    user_email: String,
    password: String,
}

impl RegisterInput {
    pub(crate) fn username(&self) -> String {
        self.username.clone()
    }

    pub(crate) fn email(&self) -> String {
        self.user_email.clone()
    }

    pub(crate) fn password(&self) -> String {
        self.password.clone()
    }
}

#[derive(Serialize, Deserialize, Debug)]
pub struct RegisterResponse {
    register: bool,
}

impl RegisterResponse {
    pub fn new(register: bool) -> Self {
        Self {
            register,
        }
    }
}

#[derive(Serialize, Deserialize, Debug)]
pub struct RefreshInput {
    refresh_token: String,
}

impl RefreshInput {
    pub fn refresh_token(&self) -> String {
        self.refresh_token.to_string()
    }
}

#[derive(Serialize, Deserialize, Debug)]
pub struct RefreshResponse {
    authenticated: bool,
    access_token: String,
    username: String,
}

impl RefreshResponse {
    pub(crate) fn new(authenticated: bool, access_token: String, username: String) -> Self {
        Self {
            authenticated,
            access_token,
            username,
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
