use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug)]
pub struct RegisterInput {
    username: String,
    user_email: String,
    password: String,
}

impl RegisterInput {
    pub(crate) fn username(&self) -> String {
        self.username.clone()
    }

    pub(crate) fn email(&self) -> String {
        self.user_email.clone()
    }

    pub(crate) fn password(&self) -> String {
        self.password.clone()
    }
}

#[derive(Serialize, Deserialize, Debug)]
pub struct RegisterResponse {
    register: bool,
}

impl RegisterResponse {
    pub fn new(register: bool) -> Self {
        Self {
            register,
        }
    }
}