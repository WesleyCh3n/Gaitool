#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use serde_json::value::Value;
use std::path::PathBuf;
use tauri::Manager;

use analyze::core::{
    export::exporter, filter::filter, split::split, swrite::swrite,
};

#[tauri::command(async)]
fn filter_csv(
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
fn export_csv(
    file: PathBuf,
    save_dir: PathBuf,
    ranges: Vec<(u32, u32)>,
) -> Result<Value, String> {
    match exporter(file, save_dir, ranges) {
        Ok(resp) => Ok(Value::from(resp)),
        Err(e) => Err(format!("{}", e)),
    }
}

#[tauri::command(async)]
fn swrite_csv(
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

#[tauri::command]
async fn split_csv(
    file: PathBuf,
    save_dir: PathBuf,
    percent: usize,
    remap_csv: PathBuf,
) -> Result<(), String> {
    match split(&file, &save_dir, percent, &remap_csv, None) {
        Ok(()) => Ok(()),
        Err(e) => Err(format!("{}", e)),
    }
}

#[tauri::command]
async fn hash_file(dir: PathBuf) -> Result<(), String> {
    if let Ok(paths) = std::fs::read_dir(dir) {
        for path in paths {
            println!("{:#?}", path.unwrap());
        }
    } else {
        return Err("Failed to read dir".to_string());
    };

    Ok(())
}

#[tauri::command]
async fn show_main_window(window: tauri::Window) {
    window.get_window("main").unwrap().show().unwrap(); // replace "main" by the name of your window
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            filter_csv,
            export_csv,
            swrite_csv,
            split_csv,
            hash_file,
            show_main_window
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
