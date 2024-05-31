use actix_web::{Either, HttpRequest, HttpResponse, Responder};
use log::{error, info};
use crate::utils::api::{get_access_info, get_db_connection, HttpResponseBody};
use crate::utils::json::ResponseStatus::{InternalServerError, RequestOk};
use crate::utils::sql::delete::delete_refresh_token;

pub async fn logout_delete_token(req: HttpRequest) -> impl Responder {
    info!("{}", get_access_info(&req));

    let endpoint_uri = req.uri().to_string();

    let user_id = req.headers()
        // 'x-user-id' is always added by middleware so this cannot be None if reachable this method.
        .get("x-user-id").unwrap().to_str().unwrap_or("").to_string();

    if user_id.is_empty() {
        todo!();
    }

    let conn = match get_db_connection(&endpoint_uri).await {
        Either::Left(conn) => conn,
        Either::Right(response) => return response,
    };

    let result = delete_refresh_token(&user_id, &conn).await;

    if let Err(e) = result {
        error!("Delete refresh token by user logout failed. Because of [{}]", e.to_string());
        let response = HttpResponseBody::failed_new(
            "Failed to delete refresh token. However it will invalidate after 1 hour.",
            &endpoint_uri,
        );
        return InternalServerError.json_response_builder(response);
    };

    let response = HttpResponseBody::success_new("", &endpoint_uri);
    RequestOk.json_response_builder(response)
}