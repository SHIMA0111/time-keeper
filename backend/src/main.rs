use std::env;
use actix_cors::Cors;
use actix_web::{App, Either, HttpRequest, HttpServer, Responder, web};
use log::{error, info, warn};
use serde::{Deserialize, Serialize};
use crate::api::authed::categories::get_category_data;
use crate::api::authed::category_alias::add_category_alias;
use crate::api::authed::category_setting::category_setting;
use crate::api::authed::logout::logout_delete_token;
use crate::api::general::login::login_auth;
use crate::api::general::refresh::refresh;
use crate::api::general::register::register_new;
use crate::utils::api::{get_access_info, get_db_connection, HttpResponseBody};
use crate::utils::middleware::AccessTokenVerification;
use crate::utils::response::ResponseStatus::{InternalServerError, RequestOk};
use crate::utils::sql::create_table::create_sub_category_table;

mod data;
mod utils;
mod api;

#[derive(Serialize, Deserialize, Debug)]
struct TestInput {
    superior_table: String,
    display_name: String,
}

async fn add_table_test(data: web::Query<TestInput>, req: HttpRequest) -> impl Responder {
    warn!("Called test function: {}", get_access_info(&req));
    let endpoint_uri = req.uri().to_string();

    let mut conn = match get_db_connection(&endpoint_uri).await {
        Either::Left(conn) => conn,
        Either::Right(res) => return res,
    };

    let superior_table = &data.superior_table;
    let display_name = &data.display_name;

    let res = create_sub_category_table(superior_table, display_name, &mut conn).await;

    if let Err(e) = res {
        error!("Failed to create table process by [{:?}]", e);
        let response = HttpResponseBody::failed_new(
            "Failed to create table. Please see log.",
            &endpoint_uri
        );
        return InternalServerError.json_response_builder(response);
    }

    info!("Complete create table");
    let response = HttpResponseBody::success_new("", &endpoint_uri);
    RequestOk.json_response_builder(response)
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    env_logger::init_from_env(env_logger::Env::new().default_filter_or("info"));
    if env::var("JWT_SECRET_KEY").is_err() {
        warn!("JWT_SECRET_KEY hasn't been set as env var so jwt will be generated using \"\" as secret key");
    }

    HttpServer::new(|| {
        let cors = Cors::default()
            .allow_any_header()
            .allow_any_method()
            .allowed_origin("http://localhost:5173");

        App::new()
            .wrap(cors)
            .service(
                web::scope("/v1/authed")
                    .wrap(AccessTokenVerification)
                    .route("/logout", web::delete().to(logout_delete_token))
                    .route("/category_setting", web::get().to(category_setting))
                    .route("/category_name", web::get().to(get_category_data))
                    .route("/create_alias", web::post().to(add_category_alias))
            )
            .service(
                web::scope("/v1/general")
                    .route("/login", web::post().to(login_auth))
                    .route("/register", web::post().to(register_new))
                    .route("/refresh", web::post().to(refresh))
                    .route("/test/create_table", web::get().to(add_table_test))
            )
    })
        .bind(("127.0.0.1", 8888))?
        .run()
        .await
}