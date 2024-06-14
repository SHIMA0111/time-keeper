pub struct Token {
    token: String,
    iat: i64,
    exp: i64,
}

impl Token {
    pub fn new(token: String, iat: i64, exp: i64) -> Self {
        Self {
            token, iat, exp
        }
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
}
