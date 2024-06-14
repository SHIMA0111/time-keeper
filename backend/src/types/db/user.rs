use serde::{Deserialize, Serialize};
use uuid::Uuid;
use crate::utils::hash::hash_password;

#[derive(Serialize, Deserialize, Debug)]
pub struct CreateUser {
    username: String,
    email: String,
    password: String,
}

impl CreateUser {
    pub fn username(&self) -> String {
        self.username.clone()
    }

    pub fn email(&self) -> String {
        self.email.clone()
    }

    pub fn hash_password(&self) -> String {
        hash_password(&self.password)
    }
}

#[derive(Debug)]
pub struct UpdateUserInfo {
    id: Uuid,
    username: String,
    email: String,
}

#[derive(Debug)]
pub struct User {
    id: Uuid,
    username: String,
    email: String,
    password: Option<String>,
}

impl User {
    pub fn new(id: Uuid, username: String, email: String, password: Option<String>) -> Self {
        Self {
            id, username, email, password
        }
    }

    pub fn user_id(&self) -> Uuid {
        self.id
    }

    pub fn username(&self) -> String {
        self.username.clone()
    }

    pub fn email(&self) -> String {
        self.email.clone()
    }

    pub fn password(&self) -> Option<String> {
        self.password.clone()
    }
}
