use serde_json::value::Value;
use std::path::PathBuf;

use super::{filter, swrite};

#[tauri::command(async)]
pub fn filter_csv(
    file: PathBuf,
    save_dir: PathBuf,
    remap_csv: PathBuf,
    filter_csv: PathBuf,
) -> Result<Value, String> {
    match filter(file, save_dir, remap_csv, filter_csv) {
        Ok(resp) => Ok(Value::from(resp)),
        Err(e) => Err(format!("{}", e)),
    }
}

#[tauri::command(async)]
pub fn swrite_csv(
    file: PathBuf,
    save_dir: PathBuf,
    ranges_value: String,
    remap_csv: PathBuf,
) -> Result<Value, String> {
    match swrite(file, save_dir, ranges_value, remap_csv) {
        Ok(resp) => Ok(Value::from(resp)),
        Err(e) => Err(format!("{}", e)),
    }
}
