use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug)]
pub struct UserUpdateInput {
    username: String,
    email: String,
}

impl UserUpdateInput {
    pub fn username(&self) -> String {
        self.username.clone()
    }

    pub fn email(&self) -> String {
        self.email.clone()
    }
}
