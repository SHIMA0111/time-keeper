use actix_web::{Either, HttpRequest, Responder};
use actix_web::web::Json;
use log::{error, info};
use crate::utils::api::{get_access_info, get_db_connection, HttpResponseBody};
use crate::utils::header::get_user_id;
use crate::utils::response::ResponseStatus::{InternalServerError, RequestOk};
use crate::utils::sql::insert::insert_alias;
use crate::utils::types::category_alias::CategoryAliasInput;

pub async fn add_category_alias(alias_data: Json<CategoryAliasInput>, req: HttpRequest) -> impl Responder {
    info!("{}", get_access_info(&req));
    let endpoint_uri = req.uri().to_string();

    let conn = match get_db_connection(&endpoint_uri).await {
        Either::Left(conn) => conn,
        Either::Right(res) => return res,
    };

    let user_id = match get_user_id(&req) {
        Either::Left(uid) => uid,
        Either::Right(response) => return response,
    };

    let alias_name = alias_data.alias_name();
    let top_id = alias_data.top_id();
    let sub1_id = alias_data.sub1_id();
    let sub2_id = alias_data.sub2_id();
    let sub3_id = alias_data.sub3_id();
    let sub4_id = alias_data.sub4_id();

    if let Err(e) =
        insert_alias(&alias_name, top_id, sub1_id, sub2_id, sub3_id, sub4_id, &user_id, &conn).await {
        error!("Failed to insert the new alias due to {:?}", e);
        let response = HttpResponseBody::failed_new(
            "Failed to register new alias",
            &endpoint_uri
        );
        return InternalServerError.json_response_builder(response);
    }

    let response = HttpResponseBody::success_new("", &endpoint_uri);
    RequestOk.json_response_builder(response)
}
