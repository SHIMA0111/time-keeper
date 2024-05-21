use std::future::{Ready, ready};
use actix_web::dev::{Service, ServiceRequest, ServiceResponse, Transform, forward_ready};
use actix_web::{Error, HttpResponse};
use actix_web::body::EitherBody;
use actix_web::http::header::WWW_AUTHENTICATE;
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

    fn call(&self, req: ServiceRequest) -> Self::Future {
        let authorization_info = match req.headers().get("Authorization") {
            Some(authorize_value) => authorize_value.to_str().unwrap_or(""),
            None => "",
        };
        let uri = req.uri().to_string();

        let result = bearer_verify(authorization_info);

        if let Authorized = result {
            let fut = self.service.call(req);
            Box::pin(async move {
                let res = fut.await?;

                println!("Hi from response");
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
    InvalidToken,
    ExpiredToken,
    Authorized,
}

fn bearer_verify(bearer_token: &str) -> TokenVerificationResult {
    if !bearer_token.starts_with(TOKEN_SCHEMA) {
        error!("Authorization header format is wrong. Require 'Bearer'");
        return NoTokenProvided;
    }
    let mut bearer_token = bearer_token.to_string();
    let token_raw = bearer_token.drain(TOKEN_SCHEMA.len()..);
    let token = token_raw.as_str().trim_start();

    if token.is_empty() {
        error!("Access token is empty.");
        return NoTokenProvided;
    }

    match access_token_verify(token) {
        Ok(_) => {
            info!("Access token verification success.");
            Authorized
        },
        Err(e) => {
            error!("Access token verification failed due to [{}]", e.to_string());
            match e {
                AuthenticateError::AccessTokenInvalidException(_) => InvalidToken,
                AuthenticateError::AccessTokenExpiredException(_) => ExpiredToken,
                _ => {
                    error!("Token verification process failed due to something wrong.({})", e.to_string());
                    InvalidToken
                }
            }
        }
    }
}

fn build_response_token_failed(token_verification_result: TokenVerificationResult, endpoint: &str) -> HttpResponse {
    let (realm, status_code) = match token_verification_result {
        ExpiredToken => ("expired_token", StatusCode::UNAUTHORIZED),
        InvalidToken => ("invalid_token", StatusCode::UNAUTHORIZED),
        NoTokenProvided => ("require_token", StatusCode::UNAUTHORIZED),
        _ => ("", StatusCode::INTERNAL_SERVER_ERROR)
    };

    let response_header_value = format!("Bearer realm=\"{}\"", realm);
    let http_response_body = HttpResponseBody::new(
        false, None, Some("Access Token authentication failed."), endpoint
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
