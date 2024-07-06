use chrono::{DateTime, NaiveDateTime, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Serialize, Deserialize, Debug)]
pub struct UserResponse {
    user_id: Uuid,
    username: String,
    email: String,
    created_time: DateTime<Utc>,
}

impl UserResponse {
    pub fn new(user_id: Uuid, username: String, email: String, naive_created_time: NaiveDateTime) -> Self {
        let created_time = naive_created_time.and_utc();
        Self {
            user_id, username, email, created_time
        }
    }
}
