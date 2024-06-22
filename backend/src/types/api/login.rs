use chrono::{DateTime, NaiveDateTime, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

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
    user_id: Uuid,
    username: String,
    email: String,
    created_datetime: DateTime<Utc>,
}

impl LoginResponse {
    pub fn new(authenticated: bool,
               access_token: String,
               refresh_token: String,
               user_id: Uuid,
               username: String,
               email: String,
               created_datetime: NaiveDateTime) -> Self {
        let created_datetime_utc = created_datetime.and_utc();
        Self {
            authenticated,
            access_token,
            refresh_token,
            user_id,
            username,
            email,
            created_datetime: created_datetime_utc,
        }
    }
}
