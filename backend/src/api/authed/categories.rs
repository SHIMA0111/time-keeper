use actix_web::{Either, HttpRequest, Responder, web};
use log::{error, info};
use crate::utils::api::{get_access_info, get_db_connection, HttpResponseBody};
use crate::utils::response::ResponseStatus::{InternalServerError, RequestOk};
use crate::utils::sql::get::get_categories;
use crate::utils::types::get_category::{CategoryData, GetCategoryInput};

pub async  fn get_category_data(get_info: web::Query<GetCategoryInput>, req: HttpRequest) -> impl Responder {
    info!("{}", get_access_info(&req));
    let endpoint_uri = req.uri().to_string();

    let conn = match get_db_connection(&endpoint_uri).await {
        Either::Left(conn) => conn,
        Either::Right(response) => return response,
    };

    let table_name = get_info.get_table_name();
    let superior_id = get_info.get_superior_id();

    let rows = match get_categories(&table_name, superior_id, &conn).await {
        Ok(rows) => rows,
        Err(e) => {
            error!("Getting category failed by [{:?}]", e);
            let response = HttpResponseBody::failed_new(
                "Failed to get categories",
                &endpoint_uri
            );

            return InternalServerError.json_response_builder(response);
        }
    };

    let mut categories = Vec::new();
    for row in &rows {
        let id: i32 = row.get("id");
        let name: String = row.get("name");
        let category_data = CategoryData::new(id, name);

        categories.push(category_data);
    }

    let response = HttpResponseBody::success_new(categories, &endpoint_uri);

    RequestOk.json_response_builder(response)
}