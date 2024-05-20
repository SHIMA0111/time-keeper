use sha3::{Sha3_256, Digest};
use wasm_bindgen::prelude::wasm_bindgen;

#[wasm_bindgen]
pub fn hash_from_str(value: &str) -> String {
    let mut hasher = Sha3_256::new();
    hasher.update(value);
    let result = hasher.finalize();

    format!("{:0x}", result)
}