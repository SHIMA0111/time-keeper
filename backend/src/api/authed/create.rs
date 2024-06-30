use actix_web::{Either, HttpRequest, Responder};
use actix_web::web::Json;
use log::{error, info};
use crate::services::category_service::update_create_category_service;
use crate::types::api::category::CategoryInput;
use crate::utils::api::{get_access_info, get_db_connection, HttpResponseBody};
use crate::utils::header::get_user_id;
use crate::utils::response::ResponseStatus::{InternalServerError, RequestOk};

pub async fn create_category_endpoint(input: Json<Vec<CategoryInput>>, req: HttpRequest) -> impl Responder {
    info!("{}", get_access_info(&req));

    let endpoint_uri = req.uri().to_string();

    let user_id = match get_user_id(&req) {
        Either::Left(user_id) => user_id,
        Either::Right(res) => return res,
    };
    let mut conn = match get_db_connection(&endpoint_uri).await {
        Either::Left(conn) => conn,
        Either::Right(res) => return res,
    };

    let input_data = input.iter().map(|data| data).collect::<Vec<_>>();

    let created_category_contents =
        update_create_category_service(&input_data, user_id, &mut conn).await;
    if let Err(e) = created_category_contents {
        error!("Failed to create category due to {:?}", e);
        let error_message = e.to_string();
        let response = HttpResponseBody::failed_new(
            &error_message,
            &endpoint_uri
        );
        return InternalServerError.json_response_builder(response);
    }

    info!("Finish create category process for '{}'", user_id);
    let response = HttpResponseBody::success_new(created_category_contents.unwrap(), &endpoint_uri);
    RequestOk.json_response_builder(response)
}
