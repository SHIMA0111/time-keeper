use std::future::{Ready, ready};
use std::str::FromStr;
use actix_web::dev::{Service, ServiceRequest, ServiceResponse, Transform, forward_ready};
use actix_web::{Error, HttpResponse};
use actix_web::body::EitherBody;
use actix_web::http::header::{HeaderName, HeaderValue, WWW_AUTHENTICATE, X_FRAME_OPTIONS};
use actix_web::http::StatusCode;
use futures_util::future::LocalBoxFuture;
use log::{error, info};
use crate::utils::api::HttpResponseBody;
use crate::utils::middleware::TokenVerificationResult::{Authorized, ExpiredToken, InvalidToken, NoTokenProvided};
use crate::utils::token::access_token_verify;
use crate::utils::error::AuthenticateError;

const TOKEN_SCHEMA: &str = "Bearer";
pub struct AccessTokenVerification;

impl<S, B> Transform<S, ServiceRequest> for AccessTokenVerification
where
    S: Service<ServiceRequest, Response = ServiceResponse<B>, Error = Error>,
    S::Future: 'static,
    B: 'static,
{
    type Response = ServiceResponse<EitherBody<B>>;
    type Error = Error;
    type Transform = AccessTokenVerificationService<S>;
    type InitError = ();
    type Future = Ready<Result<Self::Transform, Self::InitError>>;

    fn new_transform(&self, service: S) -> Self::Future {
        ready(Ok(AccessTokenVerificationService { service }))
    }
}

pub struct  AccessTokenVerificationService<S> {
    service: S,
}

impl<S, B> Service<ServiceRequest> for AccessTokenVerificationService<S>
where
    S: Service<ServiceRequest, Response = ServiceResponse<B>, Error = Error>,
    S::Future: 'static,
    B: 'static,
{
    type Response = ServiceResponse<EitherBody<B>>;
    type Error = Error;
    type Future = LocalBoxFuture<'static, Result<Self::Response, Self::Error>>;

    forward_ready!(service);

    fn call(&self, mut req: ServiceRequest) -> Self::Future {
        let authorization_info = match req.headers().get("Authorization") {
            Some(authorize_value) => authorize_value.to_str().unwrap_or(""),
            None => "",
        };
        let uri = req.uri().to_string();

        let result = bearer_verify(authorization_info, false);

        if let Authorized(user_id) = result {
            let header = req.headers_mut();
            let header_name = HeaderName::from_static("x-user-id");
            let header_value = match HeaderValue::from_str(&user_id) {
                Ok(value) => value,
                Err(e) => {
                    error!("user_id({}) cannot convert to header value due to {}", user_id, e.to_string());
                    HeaderValue::from_static("")
                }
            };
            header.insert(header_name, header_value);
            let fut = self.service.call(req);
            Box::pin(async move {
                let mut res: ServiceResponse<B> = fut.await?;
                let header = res.headers_mut();
                header.append(WWW_AUTHENTICATE, HeaderValue::from_static("Bearer realm=\"\""));
                info!("Finish request to {} by user_id = '{}'", uri, user_id);
                Ok(res.map_into_left_body())
            })
        }
        else {
            Box::pin(async move {
                let res =
                    build_response_token_failed(result, &uri);
                Ok(req.into_response(res).map_into_right_body())
            })
        }
    }
}

#[derive(Debug)]
enum TokenVerificationResult {
    NoTokenProvided,
    InvalidToken(String),
    ExpiredToken,
    Authorized(String),
}

fn bearer_verify(bearer_token: &str, is_api: bool) -> TokenVerificationResult {
    if !bearer_token.starts_with(TOKEN_SCHEMA) {
        error!("Authorization header format is wrong. Require 'Bearer [access_token] as Authorization header'");
        return NoTokenProvided;
    }
    let mut bearer_token = bearer_token.to_string();
    let token_raw = bearer_token.drain(TOKEN_SCHEMA.len()..);
    let token = token_raw.as_str().trim_start();

    if token.is_empty() {
        error!("Access token is empty.");
        return NoTokenProvided;
    }

    match access_token_verify(token, is_api) {
        Ok(user_id) => {
            info!("Access token for user_id = '{}' verification success.", user_id);
            Authorized(user_id)
        },
        Err(e) => {
            error!("Access token verification failed by [{}]", e.to_string());
            match e {
                AuthenticateError::AccessTokenInvalidException(e) => InvalidToken(e),
                AuthenticateError::AccessTokenExpiredException(_) => ExpiredToken,
                _ => {
                    error!("Token verification process failed due to something wrong.({})", e.to_string());
                    InvalidToken("This error is internal server error. If you face this, please let the developer know.".to_string())
                }
            }
        }
    }
}

fn build_response_token_failed(token_verification_result: TokenVerificationResult, endpoint: &str) -> HttpResponse {
    let (realm, reason, status_code) = match token_verification_result {
        ExpiredToken => ("expired_token", "Token expired".to_string(), StatusCode::UNAUTHORIZED),
        InvalidToken(e) => ("invalid_token", e, StatusCode::UNAUTHORIZED),
        NoTokenProvided => ("require_token", "authed api needs token authorization".to_string(), StatusCode::UNAUTHORIZED),
        _ => ("", "This error is internal server error. Please contact developer".to_string(), StatusCode::INTERNAL_SERVER_ERROR)
    };

    let failed_reason = format!("Access Token authentication failed by {}.", reason);
    let response_header_value = format!("Bearer realm=\"{}\"", realm);
    let http_response_body = HttpResponseBody::failed_new(
        failed_reason.as_str(), endpoint
    );

    let body = serde_json::to_string(&http_response_body).unwrap_or_else(|e| {
        error!("Build response data failed in middleware by [{}]", e.to_string());
        "".to_string()
    });

    let response = HttpResponse::build(status_code)
        .append_header((WWW_AUTHENTICATE, response_header_value))
        .body(body);

    return response
}
