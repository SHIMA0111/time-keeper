use std::env;
use actix_cors::Cors;
use actix_web::{App, HttpServer};
use crate::api::{get_all};
use crate::api::login::login_auth;
use crate::api::register::register_new;

mod data;
mod utils;
mod api;
mod middle_wear_token;

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
            .service(get_all)
            .service(login_auth)
            .service(register_new)

    })
        .bind(("127.0.0.1", 8888))?
        .run()
        .await
}