use actix_web::http::header::WWW_AUTHENTICATE;
use log::error;
use crate::utils::api::HttpResponseBody;

pub(crate) fn json_response_builder(response: HttpResponseBody, unauthorized: bool) -> actix_web::HttpResponse {
    match serde_json::to_string(&response) {
        Ok(json) => {
            if response.success() && !unauthorized {
                actix_web::HttpResponse::Ok()
                    .append_header((WWW_AUTHENTICATE, "Bearer realm=\"\""))
                    .body(json)
            }
            else if unauthorized {
                actix_web::HttpResponse::Unauthorized()
                    .append_header((WWW_AUTHENTICATE, "Bearer realm=\"\""))
                    .body(json)
            }
            else {
                actix_web::HttpResponse::InternalServerError()
                    .append_header((WWW_AUTHENTICATE, "Bearer realm=\"\""))
                    .body(json)
            }
        },
        Err(e) => {
            error!("Serialize response body failed due to: {}", e.to_string());
            actix_web::HttpResponse::InternalServerError()
                .append_header((WWW_AUTHENTICATE, "Bearer realm=\"\"")).finish()
        }
    }
}