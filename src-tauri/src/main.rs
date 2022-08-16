#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use serde_json::value::Value;
use std::path::PathBuf;
use tauri::Manager;

use analyze::core::{
    diff::diff_column, export::exporter, filter::filter, split::split,
    swrite::swrite,
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
    remap_csv_dir: PathBuf,
) -> Result<(), String> {
    match split(&file, &save_dir, percent, &remap_csv_dir, None) {
        Ok(()) => Ok(()),
        Err(e) => Err(format!("{}", e)),
    }
}

use base64ct::{Base64, Encoding};
use md5::{Digest, Md5};
use std::fs::{self, File};
use std::io::LineWriter;
use std::io::{self, prelude::*};

#[tauri::command]
async fn hash_file(dir: PathBuf, save_dir: PathBuf) -> Result<(), String> {
    if let Ok(paths) = std::fs::read_dir(dir) {
        let saved_path = save_dir.join("index.csv");
        let index_file = File::create(saved_path).unwrap();
        let mut index_file = LineWriter::new(index_file);
        for path in paths {
            let path = path.unwrap().path();
            if path.ends_with("index.csv") {
                continue;
            }

            let mut file = fs::File::open(&path).unwrap();
            let mut hasher = Md5::new();
            io::copy(&mut file, &mut hasher).unwrap();
            let hash = hasher.finalize();

            let line = format!(
                "{}, {}\n",
                &path.file_name().unwrap().to_str().unwrap(),
                Base64::encode_string(&hash)
            );
            index_file.write_all(line.as_bytes()).unwrap();
        }
    } else {
        return Err("Failed to read dir".to_string());
    };

    Ok(())
}

#[tauri::command]
async fn diff_col(
    file: PathBuf,
    remap_csv: PathBuf,
) -> Result<Vec<String>, String> {
    match diff_column(&file, &remap_csv) {
        Ok(result) => Ok(result),
        Err(e) => Err(format!("{}", e)),
    }
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
            diff_col,
            show_main_window
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
