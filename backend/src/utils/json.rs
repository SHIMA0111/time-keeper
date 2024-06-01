use log::error;
use crate::utils::api::HttpResponseBody;

#[allow(dead_code)]
pub enum ResponseStatus {
    RequestOk,
    Created,
    BadRequest,
    Unauthorized,
    Forbidden,
    NotAcceptable,
    InternalServerError,
    NotImplemented,
    ServiceUnavailable,
}

impl ResponseStatus {
    pub(crate) fn json_response_builder(&self, response: HttpResponseBody) -> actix_web::HttpResponse {
        let mut http_res = match self {
            ResponseStatus::RequestOk => actix_web::HttpResponse::Ok(),
            ResponseStatus::Created => actix_web::HttpResponse::Created(),
            ResponseStatus::BadRequest => actix_web::HttpResponse::BadRequest(),
            ResponseStatus::Unauthorized => actix_web::HttpResponse::Unauthorized(),
            ResponseStatus::Forbidden => actix_web::HttpResponse::Forbidden(),
            ResponseStatus::NotAcceptable => actix_web::HttpResponse::NotAcceptable(),
            ResponseStatus::InternalServerError => actix_web::HttpResponse::InternalServerError(),
            ResponseStatus::NotImplemented => actix_web::HttpResponse::NotImplemented(),
            ResponseStatus::ServiceUnavailable => actix_web::HttpResponse::ServiceUnavailable(),
        };

        match serde_json::to_string(&response) {
            Ok(json) => http_res.body(json),
            Err(e) => {
                error!("Serialize response body failed due to: {}", e.to_string());
                actix_web::HttpResponse::InternalServerError().finish()
            }
        }
    }
}