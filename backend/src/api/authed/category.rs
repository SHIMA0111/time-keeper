use actix_web::{Either, HttpRequest, HttpResponse, Responder};
use log::{error, info};
use crate::services::category_service::category_info;
use crate::utils::api::{get_access_info, get_db_connection, HttpResponseBody};
use crate::utils::header::get_user_id;
use crate::utils::response::ResponseStatus::{InternalServerError, RequestOk};

pub async fn category_endpoint(req: HttpRequest) -> impl Responder {
    info!("{}", get_access_info(&req));

    let endpoint_uri = req.uri().to_string();
    let user_id = match get_user_id(&req) {
        Either::Left(uid) => uid,
        Either::Right(res) => return res
    };

    let conn = match get_db_connection(&endpoint_uri).await {
        Either::Left(conn) => conn,
        Either::Right(res) => return res,
    };
    let categories = category_info(user_id, &conn).await;
    if let Err(e) = categories {
        error!("Failed to get category information due to {:?}", e);
        let error_message = e.to_string();
        let response = HttpResponseBody::failed_new(
            &error_message,
            &endpoint_uri,
        );
        return InternalServerError.json_response_builder(response);
    }
    let response = HttpResponseBody::success_new(
        categories.unwrap(),
        &endpoint_uri,
    );

    RequestOk.json_response_builder(response)
}