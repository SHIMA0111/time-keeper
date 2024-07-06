use actix_web::{Either, HttpRequest, Responder};
use log::{error, info};
use crate::services::category_service::{get_category_service};
use crate::services::table_setting_service::get_table_setting_service;
use crate::services::user_service::get_user_service;
use crate::types::api::user::UserResponse;
use crate::utils::api::{get_access_info, get_db_connection, HttpResponseBody};
use crate::utils::header::get_user_id;
use crate::utils::response::ResponseStatus::{InternalServerError, RequestOk};

pub async fn get_category_endpoint(req: HttpRequest) -> impl Responder {
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
    let categories = get_category_service(user_id, &conn).await;
    if let Err(e) = categories {
        error!("Failed to get category information due to {:?}", e);
        let error_message = e.to_string();
        let response = HttpResponseBody::failed_new(
            &error_message,
            &endpoint_uri,
        );
        return InternalServerError.json_response_builder(response);
    }

    info!("Finish get category process for '{}'", user_id);
    let response = HttpResponseBody::success_new(
        categories.unwrap(),
        &endpoint_uri,
    );
    RequestOk.json_response_builder(response)
}

pub async fn get_table_setting_endpoint(req: HttpRequest) -> impl Responder {
    info!("{}", get_access_info(&req));

    let endpoint_uri = req.uri().to_string();
    let user_id = match get_user_id(&req) {
        Either::Left(uid) => uid,
        Either::Right(res) => return res,
    };

    let conn = match get_db_connection(&endpoint_uri).await {
        Either::Left(conn) => conn,
        Either::Right(res) => return res,
    };

    let category_settings =
        get_table_setting_service(user_id, &conn).await;
    if let Err(e) = category_settings {
        error!("Failed to get category setting due to {:?}", e);
        let error_message = e.to_string();
        let response = HttpResponseBody::failed_new(
            &error_message,
            &endpoint_uri,
        );
        return InternalServerError.json_response_builder(response);
    }

    info!("Finish get table setting process for '{}'", user_id);
    let response = HttpResponseBody::success_new(
        category_settings.unwrap(), &endpoint_uri);
    RequestOk.json_response_builder(response)
}

pub async fn get_user_data_endpoint(req: HttpRequest) -> impl Responder {
    let endpoint_uri = req.uri().to_string();

    let user_id = match get_user_id(&req) {
        Either::Left(uid) => uid,
        Either::Right(res) => return res,
    };

    let conn = match get_db_connection(&endpoint_uri).await {
        Either::Left(conn) => conn,
        Either::Right(res) => return res,
    };

    let user_data = get_user_service(user_id, &conn).await;
    if let Err(e) = user_data {
        error!("Failed to get user data due to {:?}", e);
        let error_message = e.to_string();
        let response = HttpResponseBody::failed_new(
            &error_message,
            &endpoint_uri,
        );
        return InternalServerError.json_response_builder(response);
    }

    info!("Finish get user data for '{}'", user_id);
    let user = user_data.unwrap();
    let user_data = UserResponse::new(
        user.user_id(),
        user.username(),
        user.email(),
        user.created_datetime(),
    );

    let response = HttpResponseBody::success_new(user_data, &endpoint_uri);
    return RequestOk.json_response_builder(response);
}
