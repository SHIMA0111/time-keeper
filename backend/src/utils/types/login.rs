use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug)]
pub struct LoginInput {
    user_email: String,
    password: String
}

impl LoginInput {
    pub(crate) fn email(&self) -> String {
        self.user_email.to_string()
    }

    pub(crate) fn password(&self) -> String {
        self.password.to_string()
    }
}

#[derive(Serialize, Deserialize, Debug)]
pub struct LoginResponse {
    authenticated: bool,
    access_token: String,
    refresh_token: String,
    username: String,
}

impl LoginResponse {
    pub fn new(authenticated: bool, access_token: String, refresh_token: String, username: String) -> Self {
        Self {
            authenticated,
            access_token,
            refresh_token,
            username,
        }
    }
}
