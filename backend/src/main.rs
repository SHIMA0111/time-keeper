use std::env;
use actix_cors::Cors;
use actix_web::{App, Either, HttpResponse, HttpServer, Responder, web};
use log::warn;
use crate::api::authed::logout::logout_delete_token;
use crate::api::general::login::login_auth;
use crate::api::general::refresh::refresh;
use crate::api::general::register::register_new;
use crate::utils::api::get_db_connection;
use crate::utils::middleware::AccessTokenVerification;
use crate::utils::sql::create_table::create_sub_category_table;

mod data;
mod utils;
mod api;

async fn hello_world() -> impl Responder {
    let mut conn = match get_db_connection("/test").await {
        Either::Left(conn) => conn,
        Either::Right(res) => return res
    };
    match create_sub_category_table("sub_category1", "テスト2", "Test2", &mut conn).await {
        Ok(_) => println!("Success!!"),
        Err(e) => println!("{}", e.to_string())
    };
    HttpResponse::Ok().body("Hello World")
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
            )
            .service(
                web::scope("/v1/general")
                    .route("/login", web::post().to(login_auth))
                    .route("/register", web::post().to(register_new))
                    .route("/refresh", web::post().to(refresh))
                    .route("/test", web::get().to(hello_world))
            )
    })
        .bind(("127.0.0.1", 8888))?
        .run()
        .await
}