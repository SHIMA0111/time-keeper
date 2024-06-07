use actix_web::{Either, HttpRequest, Responder};
use log::{error, info};
use crate::utils::api::{get_access_info, get_db_connection, HttpResponseBody};
use crate::utils::header::get_user_id;
use crate::utils::response::ResponseStatus::{InternalServerError, RequestOk};
use crate::utils::sql::delete::delete_refresh_token;

pub async fn logout_delete_token(req: HttpRequest) -> impl Responder {
    info!("{}", get_access_info(&req));

    let endpoint_uri = req.uri().to_string();
    let user_id = match get_user_id(&req) {
        Either::Left(uid) => uid,
        Either::Right(response) => return response,
    };

    let conn = match get_db_connection(&endpoint_uri).await {
        Either::Left(conn) => conn,
        Either::Right(response) => {
            error!("Access DB failed.");
            return response;
        },
    };

    let result = delete_refresh_token(&user_id, &conn).await;

    if let Err(e) = result {
        error!("Delete refresh token by user logout failed. Because of [{}]", e.to_string());
        let response = HttpResponseBody::failed_new(
            "Failed to delete refresh token. However it will be invalidated after 1 hour.",
            &endpoint_uri,
        );
        return InternalServerError.json_response_builder(response);
    };
    info!("Delete refresh token completed.");

    let response = HttpResponseBody::success_new("", &endpoint_uri);
    info!("Complete logout process");
    RequestOk.json_response_builder(response)
}