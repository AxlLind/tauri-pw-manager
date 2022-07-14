#![cfg_attr(all(not(debug_assertions), target_os = "windows"), windows_subsystem = "windows")]
mod database;
mod cryptography;
mod error;

use std::fs;
use std::path::{Path, PathBuf};
use once_cell::sync::Lazy;
use crate::cryptography::EncryptedBlob;
use crate::database::CredentialsDatabase;
use crate::error::UserFacingError;

static APP_FOLDER: Lazy<PathBuf> = once_cell::sync::Lazy::new(|| {
  // TODO: Handle windows here
  let home_folder = std::env::var("HOME").expect("$HOME not set!");
  let app_folder = Path::new(&home_folder).join(".tauri-pw-manager");
  if !app_folder.exists() {
    fs::create_dir(&app_folder).expect("Could not create app folder");
  }
  app_folder
});

#[tauri::command]
fn login(username: String, password: String) -> Result<(), UserFacingError> {
  println!("Logging in, username={username}");
  let db_path = APP_FOLDER.clone().join(format!("{username}.pwdb"));
  if !db_path.exists() {
    return Err(UserFacingError::InvalidCredentials);
  }
  let bytes = fs::read(db_path)?;
  let mut salt = [0; 12];
  salt.copy_from_slice(&bytes[0..12]);
  let encrypted_blob = EncryptedBlob::from_bytes(&bytes[12..]).ok_or(UserFacingError::InvalidDatabase)?;
  let key = cryptography::pbkdf2_hmac(password.as_bytes(), &salt);
  let decrypted_bytes = cryptography::decrypt(&key, &encrypted_blob).map_err(|_| UserFacingError::InvalidCredentials)?;
  let db = serde_json::from_slice::<CredentialsDatabase>(&decrypted_bytes).map_err(|_| UserFacingError::InvalidCredentials)?;
  println!("{:?}", db);
  if db.username() != username {
    return Err(UserFacingError::InvalidDatabase);
  }
  Ok(())
}

#[tauri::command]
fn create_account(username: String, password: String) -> Result<(), UserFacingError> {
  println!("Creating account, username={username}");
  let db_path = APP_FOLDER.clone().join(format!("{username}.pwdb"));
  if db_path.exists() {
    return Err(UserFacingError::UsernameTaken);
  }
  let salt = cryptography::random_bytes::<12>();
  let key = cryptography::pbkdf2_hmac(password.as_bytes(), &salt);
  let db = database::CredentialsDatabase::new(username);
  let serialized_db = serde_json::to_vec(&db)?;
  let encrypted_blob = cryptography::encrypt(&key, &serialized_db)?;
  let file_content = salt.into_iter().chain(encrypted_blob.iter()).collect::<Vec<_>>();
  fs::write(db_path, &file_content)?;
  Ok(())
}

fn main() {
  let context = tauri::generate_context!();
  tauri::Builder::default()
    .menu(if cfg!(target_os = "macos") {
      tauri::Menu::os_default(&context.package_info().name)
    } else {
      tauri::Menu::default()
    })
    .invoke_handler(tauri::generate_handler![login, create_account])
    .run(context)
    .expect("error while running tauri application");
}
