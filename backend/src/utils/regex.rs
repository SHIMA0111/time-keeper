use actix_web::{Either, HttpResponse};
use log::error;
use regex::Regex;
use crate::utils::api::HttpResponseBody;
use crate::utils::response::ResponseStatus::{BadRequest, InternalServerError};

pub const MAIL_PATTERN: &str = r"[A-Za-z0-9.+_-]+@[A-Za-z0-9.-]+\.[a-z0-9.]+";

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
