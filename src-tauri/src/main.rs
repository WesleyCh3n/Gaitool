#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use std::path::PathBuf;

use analyze_rs::core::{export::exporter, filter::filter, swrite::swrite};
use serde_json::Value;

#[tauri::command(async)]
fn filter_csv(file: PathBuf, save_dir: PathBuf) -> Result<Value, String>{
    match filter(file, save_dir) {
        Ok(resp) => Ok(resp),
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
        Ok(resp) => Ok(resp),
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
        Ok(resp) => Ok(resp),
        Err(e) => Err(format!("{}", e)),
    }
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            filter_csv, export_csv, swrite_csv
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
