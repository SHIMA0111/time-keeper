use chrono::{Duration, NaiveDate};
use log::warn;
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug)]
pub struct RecordInput {
    top_id: i32,
    sub1_id: Option<i32>,
    sub2_id: Option<i32>,
    sub3_id: Option<i32>,
    sub4_id: Option<i32>,
    start: i64,
    end: i64,
    pause_starts: Vec<i64>,
    pause_ends: Vec<i64>,
}

impl RecordInput {
    pub fn get_ids(&self) -> (i32, Option<i32>, Option<i32>, Option<i32>, Option<i32>) {
        (self.top_id, self.sub1_id, self.sub2_id, self.sub3_id, self.sub4_id)
    }

    pub fn get_start_end(&self) -> (i64, i64) {
        (self.start, self.end)
    }

    pub fn get_pause_starts(&self) -> Vec<i64> {
        self.pause_starts.clone()
    }

    pub fn get_pause_ends(&self) -> Vec<i64> {
        self.pause_ends.clone()
    }

    pub fn get_date(&self) -> NaiveDate {
        let duration = Duration::milliseconds(self.start) + Duration::hours(9);
        NaiveDate::from_ymd_opt(1970, 1, 1).unwrap() + duration
    }

    pub fn get_elapsed_time(&self) -> f64 {
        let total_elapsed = self.end - self.start;
        let pause_time = self.pause_ends
            .iter()
            .enumerate()
            .map(|(index,pause_end)| {
                let pause_start = self.pause_starts.get(index);
                match pause_start {
                    Some(start) => {
                        if start > pause_end {
                            warn!("pause start: {} but the pause end is {}. Skip the pause.", start, pause_end);
                            0
                        }
                        else {
                            pause_end - start
                        }
                    },
                    None => {
                        warn!("inconsistent input. end timestamp is over than the start timestamp number.");
                        0
                    }
                }
            }).collect::<Vec<i64>>().iter().sum::<i64>();
        let last_pause_time = if self.pause_starts.len() > self.pause_ends.len() {
            if self.pause_starts.len() - self.pause_ends.len() != 1 {
                warn!("inconsistent input. start timestamp has more than 2 elements than end pause. Ignore the data except for the first one.");
            }

            // From the fist condition, if this code is executed, the pause_starts num is larger than the pause_ends.
            // Therefore, the unwrap() is always safe.
            let last_pause_start = self.pause_starts.get(self.pause_ends.len()).unwrap();
            self.end - last_pause_start
        }
        else {
            0
        };
        let total_pause_time = pause_time + last_pause_time;
        let total_elapsed_time_with_pause = total_elapsed - total_pause_time;

        (total_elapsed_time_with_pause as f64) / 3600000.0
    }
}
