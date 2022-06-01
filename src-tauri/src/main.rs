#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use std::path::PathBuf;

use analyze_rs::core::filter::filter;

#[tauri::command]
fn filter_csv(file: PathBuf, save_dir: PathBuf) {
    filter(file, save_dir).unwrap_or_else(|e| panic!("{}", e));
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![filter_csv])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
