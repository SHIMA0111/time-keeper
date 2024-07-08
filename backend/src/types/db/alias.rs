use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Serialize, Deserialize, Debug)]
pub struct Alias {
    alias_name: String,
    main_id: Uuid,
    sub1_id: Uuid,
    sub2_id: Uuid,
    sub3_id: Uuid,
    sub4_id: Uuid,
    is_auto_registered: bool,
}