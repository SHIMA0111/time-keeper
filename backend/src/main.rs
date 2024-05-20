use std::env;
use actix_web::{App, HttpServer};
use crate::api::{get_all, login_auth};

mod data;
mod utils;
mod api;
mod middle_wear_token;

#[tokio::main]
async fn main() -> std::io::Result<()> {
    env::set_var("RUST_LOG", "info");
    env_logger::init();

    HttpServer::new(|| {
        App::new()
            .service(get_all)
            .service(login_auth)
    })
        .workers(4)
        .bind(("127.0.0.1", 8888))?
        .run()
        .await
}