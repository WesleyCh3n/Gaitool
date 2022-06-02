#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use std::path::PathBuf;

use analyze_rs::core::{filter::filter, swrite::swrite};
use analyze_rs::core::export::exporter;
use serde_json::{json, Value};

#[tauri::command]
fn filter_csv(file: PathBuf, save_dir: PathBuf) -> Value {
    let result = if let Ok(resp) = filter(file, save_dir) {
        resp
    } else {
        json!({
            "Status": "Faild"
        })
    };
    result
}

#[tauri::command]
fn export_csv(file: PathBuf, save_dir: PathBuf, ranges: Vec<(u32, u32)>) -> Value {
    let result = if let Ok(resp) = exporter(file, save_dir, ranges) {
        resp
    } else {
        json!({
            "Status": "Faild"
        })
    };
    result
}

#[tauri::command]
fn swrite_csv(file: PathBuf, save_dir: PathBuf, ranges_value: String) -> Value {
    let result = if let Ok(resp) = swrite(file, save_dir, ranges_value) {
        resp
    } else {
        json!({
            "Status": "Faild"
        })
    };
    result
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![filter_csv, export_csv, swrite_csv])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
