use actix_web::{Either, HttpRequest, Responder};
use actix_web::web::Json;
use log::{error, info};
use crate::services::create_category_service::create_category_service;
use crate::types::api::create_category::CreateCategoryInput;
use crate::utils::api::{get_access_info, get_db_connection, HttpResponseBody};
use crate::utils::header::get_user_id;
use crate::utils::response::ResponseStatus::{InternalServerError, RequestOk};

pub async fn create_category_endpoint(input: Json<CreateCategoryInput>, req: HttpRequest) -> impl Responder {
    info!("{}", get_access_info(&req));

    let endpoint_uri = req.uri().to_string();

    let user_id = match get_user_id(&req) {
        Either::Left(user_id) => user_id,
        Either::Right(res) => return res,
    };
    let conn = match get_db_connection(&endpoint_uri).await {
        Either::Left(conn) => conn,
        Either::Right(res) => return res,
    };

    let created_category_contents = create_category_service(user_id,
                                                            input.table_name(),
                                                            input.category_name(),
                                                            input.superior_id(),
                                                            &conn).await;
    if let Err(e) = created_category_contents {
        error!("Failed to create category due to {:?}", e);
        let error_message = e.to_string();
        let response = HttpResponseBody::failed_new(
            &error_message,
            &endpoint_uri
        );
        return InternalServerError.json_response_builder(response);
    }

    let response = HttpResponseBody::success_new(created_category_contents.unwrap(), &endpoint_uri);
    RequestOk.json_response_builder(response)
}