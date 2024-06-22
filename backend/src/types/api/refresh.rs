use chrono::{DateTime, NaiveDateTime, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Serialize, Deserialize, Debug)]
pub struct RefreshInput {
    refresh_token: String,
}

impl RefreshInput {
    pub fn refresh_token(&self) -> String {
        self.refresh_token.to_string()
    }
}

#[derive(Serialize, Deserialize, Debug)]
pub struct RefreshResponse {
    authenticated: bool,
    access_token: String,
    user_id: Uuid,
    username: String,
    email: String,
    created_datetime: DateTime<Utc>,
}

impl RefreshResponse {
    pub(crate) fn new(authenticated: bool,
                      access_token: String,
                      user_id: Uuid,
                      username: String,
                      email: String,
                      created_datetime: NaiveDateTime) -> Self {
        let created_datetime_utc = created_datetime.and_utc();

        Self {
            authenticated,
            access_token,
            user_id,
            username,
            email,
            created_datetime: created_datetime_utc,
        }
    }
}
