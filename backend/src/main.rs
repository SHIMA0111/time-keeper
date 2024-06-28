use std::env;
use actix_cors::Cors;
use actix_web::{App, HttpServer, web};
use log::{warn};
use serde::{Deserialize, Serialize};
use crate::api::authed::get::{create_category_endpoint, get_category_endpoint, get_table_setting_endpoint};
use crate::api::authed::logout::logout_endpoint;
use crate::api::authed::update::{update_table_setting_endpoint, update_user_endpoint};
use crate::api::general::login::login_endpoint;
use crate::api::general::refresh::refresh_endpoint;
use crate::api::general::register::register_endpoint;
use crate::utils::middleware::AccessTokenVerification;

mod services;
mod utils;
mod api;
mod sql;
mod types;
pub mod errors;
pub mod db;

#[derive(Serialize, Deserialize, Debug)]
struct TestInput {
    superior_table: String,
    display_name: String,
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
            .allowed_origin("http://localhost:5173")
            .allowed_origin("http://10.13.98.142:5173")
            .allowed_origin("http://127.0.0.1:5173");

        App::new()
            .wrap(cors)
            .service(
                web::scope("/v1/authed")
                    .wrap(AccessTokenVerification)
                    .route("/categories", web::get().to(get_category_endpoint))
                    .route("/table_setting", web::get().to(get_table_setting_endpoint))
                    .route("/table_setting", web::post().to(update_table_setting_endpoint))
                    .route("/logout", web::post().to(logout_endpoint))
                    .route("/create_category", web::post().to(create_category_endpoint))
                    .route("/update_user", web::post().to(update_user_endpoint))
            )
            .service(
                web::scope("/v1/general")
                    .route("/login", web::post().to(login_endpoint))
                    .route("/register", web::post().to(register_endpoint))
                    .route("/refresh", web::post().to(refresh_endpoint))
            )
    })
        .bind(("localhost", 8888))?
        .run()
        .await
}
