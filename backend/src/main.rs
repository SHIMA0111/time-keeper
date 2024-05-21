use std::env;
use actix_cors::Cors;
use actix_web::{App, HttpResponse, HttpServer, Responder, web};
use actix_web::http::header::WWW_AUTHENTICATE;
use actix_web::web::resource;
use crate::api::{get_all};
use crate::api::login::login_auth;
use crate::api::register::register_new;
use crate::utils::middleware::AccessTokenVerification;

mod data;
mod utils;
mod api;

async fn authed_index() -> impl Responder {
    HttpResponse::Ok()
        .append_header((WWW_AUTHENTICATE, "\"\""))
        .finish()
}

async fn general_index() -> impl Responder {
    HttpResponse::Ok().finish()
}

#[tokio::main]
async fn main() -> std::io::Result<()> {
    env::set_var("RUST_LOG", "info");
    env_logger::init();

    HttpServer::new(|| {
        let cors = Cors::default()
            .allow_any_header()
            .allow_any_method()
            .allow_any_origin();

        App::new()
            .wrap(cors)
            .service(
                web::scope("/v1/authed")
                    .wrap(AccessTokenVerification)
                    .service(resource("/categories").get(get_all).head(get_all))
            )
            .service(
                web::scope("/v1/general")
                    .route("/login", web::post().to(login_auth))
                    .route("/register", web::post().to(register_new))
            )
    })
        .bind(("127.0.0.1", 8888))?
        .run()
        .await
}