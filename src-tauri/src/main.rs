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
  Path::new(&home_folder).join(".tauri-pw-manager")
});

fn user_db_file(username: &str) -> PathBuf {
  APP_FOLDER.join(format!("{}.pwdb", username))
}

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
fn generate_password(alphabet: String, len: usize) -> Result<String, UserFacingError> {
  if alphabet.is_empty() || !alphabet.is_ascii() {
    return Err(UserFacingError::InvalidParameter);
  }
  if len == 0 || len > 2056 {
    return Err(UserFacingError::InvalidParameter);
  }
  Ok(cryptography::generate_password(alphabet.as_bytes(), len))
}

#[tauri::command]
fn fetch_credentials(session_mutex: State<'_, Mutex<Option<UserSession>>>) -> Result<CredentialsDatabase, UserFacingError> {
  println!("Fetching credentials");
  let session_guard = session_mutex.lock()?;
  let session = session_guard.as_ref().ok_or(UserFacingError::InvalidCredentials)?;
  let path = user_db_file(&session.username);
  if !path.exists() {
    return Err(UserFacingError::InvalidCredentials);
  }
  let bytes = fs::read(&path)?;
  db_from_encrypted_bytes(&session.key, &bytes[12..])
}

#[tauri::command]
fn add_credentials(name: String, username: String, password: String, session_mutex: State<'_, Mutex<Option<UserSession>>>) -> Result<CredentialsDatabase, UserFacingError> {
  println!("Adding credential, name={name}, username={username}, password={password}");
  if name.is_empty() || username.is_empty() || password.is_empty() {
    return Err(UserFacingError::InvalidCredentials);
  }
  let session_guard = session_mutex.lock()?;
  let session = session_guard.as_ref().ok_or(UserFacingError::InvalidCredentials)?;
  let path = user_db_file(&session.username);
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
  if username.is_empty() || password.is_empty() {
    return Err(UserFacingError::InvalidCredentials);
  }
  let mut session = session.lock()?;
  if session.is_some() {
    return Err(UserFacingError::Unexpected);
  }
  let db_path = user_db_file(&username);
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
  if username.is_empty() || password.is_empty() {
    return Err(UserFacingError::InvalidCredentials);
  }
  let mut session = session.lock()?;
  if session.is_some() {
    return Err(UserFacingError::Unexpected);
  }
  let path = user_db_file(&username);
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
  if !APP_FOLDER.exists() {
    fs::create_dir(&*APP_FOLDER).expect("could not create app folder");
  }
  let context = tauri::generate_context!();
  tauri::Builder::default()
    .menu(tauri::Menu::os_default(&context.package_info().name))
    .manage(Mutex::<Option<UserSession>>::default())
    .invoke_handler(tauri::generate_handler![login, logout, create_account, fetch_credentials, add_credentials, generate_password])
    .run(context)
    .expect("error while running tauri application");
}
