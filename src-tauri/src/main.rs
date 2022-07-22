#![cfg_attr(all(not(debug_assertions), target_os = "windows"), windows_subsystem = "windows")]
mod database;
mod cryptography;
mod error;

use std::fs;
use std::path::{Path, PathBuf};
use std::sync::Mutex;
use once_cell::sync::Lazy;
use tauri::State;
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

#[derive(Debug, Default)]
struct UserSession {
  username: String,
  key: [u8; 32],
}

fn db_from_encrypted_bytes(key: &[u8], bytes: &[u8]) -> Result<CredentialsDatabase, UserFacingError> {
  let encrypted_blob = EncryptedBlob::from_bytes(&bytes).ok_or(UserFacingError::InvalidDatabase)?;
  let decrypted_bytes = cryptography::decrypt(&key, &encrypted_blob).map_err(|_| UserFacingError::InvalidCredentials)?;
  serde_json::from_slice::<CredentialsDatabase>(&decrypted_bytes).map_err(|_| UserFacingError::InvalidCredentials)
}

fn write_db_to_file(salt: &[u8], key: &[u8], db: &CredentialsDatabase, path: &PathBuf) -> Result<(), UserFacingError> {
  let serialized_db = serde_json::to_vec(&db)?;
  let encrypted_blob = cryptography::encrypt(&key, &serialized_db)?;
  let file_content = salt.iter().copied().chain(encrypted_blob.iter()).collect::<Vec<_>>();
  fs::write(path, &file_content)?;
  Ok(())
}

#[tauri::command]
fn fetch_credentials(session_mutex: State<'_, Mutex<Option<UserSession>>>) -> Result<CredentialsDatabase, UserFacingError> {
  println!("Fetching credentials");
  let session_guard = session_mutex.lock()?;
  let session = session_guard.as_ref().ok_or(UserFacingError::InvalidCredentials)?;
  let path = APP_FOLDER.clone().join(format!("{}.pwdb", session.username));
  if !path.exists() {
    return Err(UserFacingError::InvalidCredentials);
  }
  let bytes = fs::read(&path)?;
  db_from_encrypted_bytes(&session.key, &bytes[12..])
}

#[tauri::command]
fn add_credentials(name: String, username: String, password: String, session_mutex: State<'_, Mutex<Option<UserSession>>>) -> Result<CredentialsDatabase, UserFacingError> {
  println!("Adding credential, name={name}, username={username}, password={password}");
  let session_guard = session_mutex.lock()?;
  let session = session_guard.as_ref().ok_or(UserFacingError::InvalidCredentials)?;
  let path = APP_FOLDER.clone().join(format!("{}.pwdb", session.username));
  if !path.exists() {
    return Err(UserFacingError::InvalidCredentials);
  }
  let bytes = fs::read(&path)?;
  let (salt, blob) = bytes.split_at(12);
  let mut db = db_from_encrypted_bytes(&session.key, blob)?;
  db.add(name, username, password);
  write_db_to_file(salt, &session.key, &db, &path)?;
  Ok(db)
}

#[tauri::command]
fn login(username: String, password: String, session: State<'_, Mutex<Option<UserSession>>>) -> Result<(), UserFacingError> {
  println!("Logging in, username={username}");
  let mut session = session.lock()?;
  if session.is_some() {
    return Err(UserFacingError::Unexpected);
  }
  let db_path = APP_FOLDER.clone().join(format!("{username}.pwdb"));
  if !db_path.exists() {
    return Err(UserFacingError::InvalidCredentials);
  }
  let bytes = fs::read(db_path)?;
  let (salt, blob) = bytes.split_at(12);
  let key = cryptography::pbkdf2_hmac(password.as_bytes(), salt);
  let db = db_from_encrypted_bytes(&key, blob)?;
  if db.username() != username {
    return Err(UserFacingError::InvalidDatabase);
  }
  *session = Some(UserSession { username, key });
  Ok(())
}

#[tauri::command]
fn logout(session: State<'_, Mutex<Option<UserSession>>>) -> Result<(), UserFacingError> {
  let mut session = session.lock()?;
  println!("Logging out, logged_in={}", session.is_some());
  *session = None;
  Ok(())
}

#[tauri::command]
fn create_account(username: String, password: String, session: State<'_, Mutex<Option<UserSession>>>) -> Result<(), UserFacingError> {
  println!("Creating account, username={username}");
  let mut session = session.lock()?;
  if session.is_some() {
    return Err(UserFacingError::Unexpected);
  }
  let path = APP_FOLDER.clone().join(format!("{username}.pwdb"));
  if path.exists() {
    return Err(UserFacingError::UsernameTaken);
  }
  let salt = cryptography::random_bytes::<12>();
  let key = cryptography::pbkdf2_hmac(password.as_bytes(), &salt);
  let db = CredentialsDatabase::new(username.clone());
  write_db_to_file(&salt, &key, &db, &path)?;
  *session = Some(UserSession { username, key });
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
    .manage(Mutex::<Option::<UserSession>>::default())
    .invoke_handler(tauri::generate_handler![login, logout, create_account, fetch_credentials, add_credentials])
    .run(context)
    .expect("error while running tauri application");
}
