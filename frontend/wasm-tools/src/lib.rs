pub mod auth_crypt;

use std::panic;
use chrono::Utc;
use wasm_bindgen::prelude::*;

const HOURS_SEC: u64 = 3600;
const MINUTES_SEC: u64 = 60;

#[wasm_bindgen]
extern "C" {
    #[wasm_bindgen(js_namespace = console)]
    fn console_log(s: &str);

    #[wasm_bindgen(js_namespace = console, js_name = error)]
    fn console_error(s: &str);
}

#[wasm_bindgen]
pub fn calc_time(start: u64, pause_starts: &[u64], pause_ends: &[u64]) -> Option<u64> {
    panic::set_hook(Box::new(console_error_panic_hook::hook));

    let tmp_pause_starts = if pause_starts.len() - pause_ends.len() == 1 {
        pause_starts[..pause_ends.len()].iter().map(|val| *val).collect::<Vec<u64>>()
    }
    else if pause_starts.len() == pause_ends.len() {
        pause_starts.iter().map(|val| *val).collect::<Vec<u64>>()
    }
    else {
        console_error(
            &format!(
                "pause start times number must be equal or over 1 than pause end times, \
                but got {} difference.", pause_starts.len() - pause_ends.len()));
        return None;
    };

    let total_pause_time = if tmp_pause_starts.iter().zip(pause_ends.iter()).all(|(start, end)| end >= start) {
        pause_starts.iter().zip(pause_ends.iter()).map(|(start, end)| {
            end - start
        }).collect::<Vec<u64>>().iter().sum::<u64>()
    }
    else {
        console_error("pause time set is inconsistent.");
        return None
    };

    let current_time = Utc::now().timestamp_millis();
    if current_time <= 0 {
        console_error(
            &format!(
                "Current UNIX time(time from 1970-01-01T00:00:00) always must be positive \
                but your system indicates negative(or zero) value('{}').", current_time));
        return None
    };

    let reference_time = match pause_starts.len() - pause_ends.len() {
        0 => current_time as u64,
        1 => pause_starts.last().cloned().unwrap_or_else(|| current_time as u64),
        _ => return None
    };

    let elapsed_time = reference_time - (start + total_pause_time);
    Some(elapsed_time)
}

#[wasm_bindgen]
pub fn second_to_str(sec: u64) -> String {
    let mut tmp_sec = sec;

    let hours = if tmp_sec >= HOURS_SEC {
        let tmp_hours = tmp_sec / HOURS_SEC;
        tmp_sec -= tmp_hours * HOURS_SEC;
        tmp_hours
    } else { 0 };
    let minutes = if tmp_sec >= MINUTES_SEC {
        let tmp_minutes = tmp_sec / MINUTES_SEC;
        tmp_sec -= tmp_minutes * MINUTES_SEC;
        tmp_minutes
    } else { 0 };

    let num_to_str = |num: u64| -> String {
        if num < 10 {
            format!("0{}", num)
        }
        else {
            format!("{}", num)
        }
    };

    format!("{}:{}:{}", num_to_str(hours), num_to_str(minutes), num_to_str(tmp_sec))
}

#[cfg(test)]
mod test {
    use std::time::{SystemTime, UNIX_EPOCH};
    use crate::{calc_time, second_to_str};

    #[test]
    fn test_calc_time() {
        let pause_starts = vec![1, 2, 3];
        let pause_ends = vec![4, 5, 6];
        let calc_time = calc_time(10, &pause_starts, &pause_ends);
        let current_time = SystemTime::now().duration_since(UNIX_EPOCH).unwrap().as_millis() as u64;
        assert_eq!(calc_time.unwrap(), current_time - 19);
    }

    #[test]
    fn test_sec_to_str() {
        let str_1 = second_to_str(3661);
        assert_eq!(&str_1, "01:01:01");
        let str_2 = second_to_str(16);
        assert_eq!(&str_2, "00:00:16");
        let str_3 = second_to_str(459315);
        assert_eq!(&str_3, "127:35:15");
    }
}

