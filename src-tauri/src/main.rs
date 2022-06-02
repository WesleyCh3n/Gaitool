#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use std::path::PathBuf;

use analyze_rs::core::filter::filter;
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

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![filter_csv])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
