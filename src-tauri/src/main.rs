#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use std::path::PathBuf;

use analyze_rs::core::{export::exporter, filter::filter, swrite::swrite, split::split};
use serde_json::value::Value;

#[tauri::command(async)]
fn filter_csv(file: PathBuf, save_dir: PathBuf) -> Result<Value, String>{
    match filter(file, save_dir) {
        Ok(resp) => Ok(Value::from(resp)),
        Err(e) => Err(format!("{}", e))
    }
}

#[tauri::command(async)]
fn export_csv(
    file: PathBuf,
    save_dir: PathBuf,
    ranges: Vec<(u32, u32)>,
) -> Result<Value, String> {
    match exporter(file, save_dir, ranges) {
        Ok(resp) => Ok(Value::from(resp)),
        Err(e) => Err(format!("{}", e))
    }
}

#[tauri::command(async)]
fn swrite_csv(
    file: PathBuf,
    save_dir: PathBuf,
    ranges_value: String,
) -> Result<Value, String> {
    match swrite(file, save_dir, ranges_value) {
        Ok(resp) => Ok(Value::from(resp)),
        Err(e) => Err(format!("{}", e)),
    }
}

#[tauri::command(async)]
fn split_csv(
    file_dir: PathBuf,
    save_dir: PathBuf,
    percent: usize,
) -> Result<(), String> {
    match split(file_dir, save_dir, percent) {
        Ok(()) => Ok(()),
        Err(e) => Err(format!("{}", e)),
    }
}


fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            filter_csv, export_csv, swrite_csv, split_csv
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
