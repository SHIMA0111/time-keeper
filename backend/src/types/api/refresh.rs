use serde::{Deserialize, Serialize};

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
}

impl RefreshResponse {
    pub(crate) fn new(authenticated: bool, access_token: String) -> Self {
        Self {
            authenticated, access_token,
        }
    }
}
