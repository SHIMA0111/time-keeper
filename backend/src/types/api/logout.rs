use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug)]
pub struct LogoutInput {
    refresh_token: String
}

impl LogoutInput {
    pub fn refresh_token(&self) -> String {
        self.refresh_token.to_string()
    }
}
