use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug)]
pub struct RegisterResponse {
    register: bool,
}

impl RegisterResponse {
    pub fn new(register: bool) -> Self {
        Self {
            register,
        }
    }
}