use std::env;
use actix_cors::Cors;
use actix_web::{App, HttpServer, web};
use log::warn;
use crate::api::authed::logout::logout_delete_token;
use crate::api::general::login::login_auth;
use crate::api::general::refresh::refresh;
use crate::api::general::register::register_new;
use crate::utils::middleware::AccessTokenVerification;

mod data;
mod utils;
mod api;

#[tokio::main]
async fn main() -> std::io::Result<()> {
    env_logger::init_from_env(env_logger::Env::new().default_filter_or("info"));
    if env::var("JWT_SECRET_KEY").is_err() {
        warn!("JWT_SECRET_KEY hasn't been set as env var so jwt will be generated using \"\" as secret key");
    }

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
                    .route("/logout", web::delete().to(logout_delete_token))
            )
            .service(
                web::scope("/v1/general")
                    .route("/login", web::post().to(login_auth))
                    .route("/register", web::post().to(register_new))
                    .route("/refresh", web::post().to(refresh))
            )
    })
        .bind(("127.0.0.1", 8888))?
        .run()
        .await
}