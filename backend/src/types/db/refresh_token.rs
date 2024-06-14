use uuid::Uuid;
use crate::types::token::Token;

pub struct RefreshToken {
    user_id: Uuid,
    token: String,
    iat: i64,
    exp: i64,
    is_invalid: bool,
}

impl RefreshToken {
    pub fn new(user_id: Uuid, token: String, iat: i64, exp: i64, is_invalid: bool) -> Self {
        Self {
            user_id,
            token,
            iat,
            exp,
            is_invalid,
        }
    }

    pub fn user_id(&self) -> Uuid {
        self.user_id
    }

    pub fn token(&self) -> String {
        self.token.to_string()
    }

    pub fn iat(&self) -> i64 {
        self.iat
    }

    pub fn exp(&self) -> i64 {
        self.exp
    }

    pub fn is_invalid(&self) -> bool {
        self.is_invalid
    }

    pub fn from_token(value: &Token, user_id: Uuid) -> Self {
        let token = value.token();
        let iat = value.iat();
        let exp = value.exp();
        Self {
            user_id,
            token,
            iat,
            exp,
            is_invalid: false,
        }
    }
}
