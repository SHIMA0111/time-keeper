use chrono::NaiveDateTime;
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
    created_datetime: NaiveDateTime
}

impl User {
    pub fn new(id: Uuid,
               username: String,
               email: String,
               password: Option<String>,
               created_datetime: NaiveDateTime) -> Self {
        Self {
            id, username, email, password, created_datetime
        }
    }

    pub fn remove_password_info(mut self) -> Self {
        self.password = None;
        self
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

    pub fn created_datetime(&self) -> NaiveDateTime {
        self.created_datetime
    }
}
