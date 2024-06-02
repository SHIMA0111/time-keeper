use argon2::{Argon2, PasswordHash, PasswordHasher, PasswordVerifier};
use argon2::password_hash::rand_core::OsRng;
use argon2::password_hash::SaltString;
use log::error;

pub(crate) fn hash_password(password: &str) -> String {
    let salt = SaltString::generate(&mut OsRng);

    let argon2 = Argon2::default();

    match argon2.hash_password(password.as_bytes(), &salt) {
        Ok(hashed_value) => hashed_value.to_string(),
        Err(e) => {
            error!("password hash process failed due to {}", e.to_string());
            "".to_string()
        }
    }
}

pub(crate) fn verify_password(password: &str, hash_password: &str) -> bool {
    let parsed_hash = match PasswordHash::new(&hash_password) {
        Ok(hash_parser) => hash_parser,
        Err(e) => {
            error!("verify password process failed due to {}", e.to_string());
            return false;
        }
    };
    Argon2::default().verify_password(password.as_bytes(), &parsed_hash).is_ok()
}
