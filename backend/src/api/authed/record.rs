use actix_web::{Either, HttpRequest, Responder};
use actix_web::web::Json;
use log::{error, info};
use crate::utils::api::{get_access_info, get_db_connection, HttpResponseBody};
use crate::utils::header::get_user_id;
use crate::utils::response::ResponseStatus::{InternalServerError, RequestOk};
use crate::utils::sql::insert::insert_record;
use crate::utils::types::record::RecordInput;

pub async  fn add_record(records: Json<RecordInput>, req: HttpRequest) -> impl Responder {
    info!("{}", get_access_info(&req));

    let endpoint = req.uri().to_string();

    let conn = match get_db_connection(&endpoint).await {
        Either::Left(conn) => conn,
        Either::Right(res) => return res,
    };

    let user_id = match get_user_id(&req) {
        Either::Left(uid) => uid,
        Either::Right(req) => return req
    };
    let (top_id,
        sub1_id,
        sub2_id,
        sub3_id,
        sub4_id) = records.get_ids();
    let total_time = records.get_elapsed_time();
    let date = records.get_date();
    let (start, end) = records.get_start_end();
    let pause_starts = records.get_pause_starts();
    let pause_ends = records.get_pause_ends();

    let res = insert_record(&user_id, top_id, sub1_id,
                            sub2_id, sub3_id, sub4_id, total_time, date, start, end,
                            &pause_starts, &pause_ends, &conn).await;

    if let Err(e) = res {
        error!("Insert record process failed due to {:?}", e);
        let res = HttpResponseBody::failed_new(
            "Time record insert process failed",
            &endpoint
        );
        return InternalServerError.json_response_builder(res);
    }

    let res = HttpResponseBody::success_new("", &endpoint);
    return RequestOk.json_response_builder(res);
}