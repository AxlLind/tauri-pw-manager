#![forbid(unsafe_code)]
#![cfg_attr(all(not(debug_assertions), target_os = "windows"), windows_subsystem = "windows")]
mod database;
mod cryptography;
mod error;

use std::fs;
use std::path::{Path, PathBuf};
use std::sync::Mutex;
use once_cell::sync::Lazy;
use itertools::Itertools;
use arboard::Clipboard;
use tauri::State;
use log::LevelFilter;
use simple_logger::SimpleLogger;
use crate::cryptography::EncryptedBlob;
use crate::database::CredentialsDatabase;
use crate::error::UserFacingError;

static APP_FOLDER: Lazy<PathBuf> = Lazy::new(|| {
  // TODO: Handle windows here
  let home_folder = std::env::var("HOME").expect("$HOME not set!");
  Path::new(&home_folder).join(".tauri-pw-manager")
});

fn user_db_file(username: &str) -> PathBuf {
  APP_FOLDER.join(format!("{username}.pwdb"))
}

#[derive(Debug, Default)]
struct UserSession {
  username: String,
  key: [u8; 32],
}

fn write_db_to_file(salt: &[u8], key: &[u8], db: &CredentialsDatabase, path: &PathBuf) -> Result<(), UserFacingError> {
  let encrypted_blob = EncryptedBlob::encrypt(db, key)?;
  let file_content = salt.iter().copied().chain(encrypted_blob.bytes()).collect::<Vec<_>>();
  fs::write(path, &file_content)?;
  Ok(())
}

#[tauri::command]
fn copy_to_clipboard(text: String) -> Result<(), UserFacingError> {
  Clipboard::new()?.set_text(text)?;
  Ok(())
}

#[tauri::command]
fn generate_password(length: usize, lowercase: bool, uppercase: bool, digits: bool, special: bool) -> Result<String, UserFacingError> {
  log::debug!("Generating password: length={length}, lowercase={lowercase}, uppercase={uppercase}, digits={digits}, special={special}");
  let alphabet = [
    (lowercase, "abcdefghijklmnopqrstuvwxyz"),
    (uppercase, "ABCDEFGHIJKLMNOPQRSTUVWXYZ"),
    (digits, "0123456789"),
    (special, "!@#$%^&*"),
  ].iter()
    .filter(|(b, _)| *b)
    .map(|(_, s)| s)
    .join("");
  if alphabet.is_empty() {
    return Err(UserFacingError::InvalidParameter);
  }
  if !(10..=128).contains(&length) {
    return Err(UserFacingError::InvalidParameter);
  }
  Ok(cryptography::generate_password(alphabet.as_bytes(), length))
}

#[tauri::command]
fn fetch_credentials(session_mutex: State<'_, Mutex<Option<UserSession>>>) -> Result<CredentialsDatabase, UserFacingError> {
  log::debug!("Fetching credentials");
  let session_guard = session_mutex.lock()?;
  let session = session_guard.as_ref().ok_or(UserFacingError::InvalidCredentials)?;
  let path = user_db_file(&session.username);
  if !path.exists() {
    return Err(UserFacingError::InvalidCredentials);
  }
  let bytes = fs::read(&path)?;
  EncryptedBlob::from_bytes(&bytes[12..])?.decrypt(&session.key)
}

#[tauri::command]
fn remove_credentials(name: String, session_mutex: State<'_, Mutex<Option<UserSession>>>) -> Result<(), UserFacingError> {
  log::info!("Removing credentials, name={name}");
  let session_guard = session_mutex.lock()?;
  let session = session_guard.as_ref().ok_or(UserFacingError::InvalidCredentials)?;
  let path = user_db_file(&session.username);
  if !path.exists() {
    return Err(UserFacingError::InvalidCredentials);
  }
  let file_contents = fs::read(&path)?;
  let (salt, bytes) = file_contents.split_at(12);
  let mut db: CredentialsDatabase = EncryptedBlob::from_bytes(bytes)?.decrypt(&session.key)?;
  if !db.remove(&name) {
    return Err(UserFacingError::InvalidParameter);
  }
  write_db_to_file(salt, &session.key, &db, &path)?;
  Ok(())
}

#[tauri::command]
fn add_credentials(name: String, username: String, password: String, session_mutex: State<'_, Mutex<Option<UserSession>>>) -> Result<CredentialsDatabase, UserFacingError> {
  log::info!("Adding credential, name={name}");
  if name.is_empty() || username.is_empty() || password.is_empty() {
    return Err(UserFacingError::InvalidCredentials);
  }
  let session_guard = session_mutex.lock()?;
  let session = session_guard.as_ref().ok_or(UserFacingError::InvalidCredentials)?;
  let path = user_db_file(&session.username);
  if !path.exists() {
    return Err(UserFacingError::InvalidCredentials);
  }
  let file_contents = fs::read(&path)?;
  let (salt, bytes) = file_contents.split_at(12);
  let mut db: CredentialsDatabase = EncryptedBlob::from_bytes(bytes)?.decrypt(&session.key)?;
  db.add(name, username, password);
  write_db_to_file(salt, &session.key, &db, &path)?;
  Ok(db)
}

#[tauri::command]
fn login(username: String, password: String, session: State<'_, Mutex<Option<UserSession>>>) -> Result<(), UserFacingError> {
  log::info!("Logging in, username={username}");
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
  let file_contents = fs::read(db_path)?;
  let (salt, bytes) = file_contents.split_at(12);
  let key = cryptography::pbkdf2_hmac(password.as_bytes(), salt);
  let db: CredentialsDatabase = EncryptedBlob::from_bytes(bytes)?.decrypt(&key).map_err(|_| UserFacingError::InvalidCredentials)?;
  if db.username() != username {
    return Err(UserFacingError::InvalidDatabase);
  }
  *session = Some(UserSession { username, key });
  Ok(())
}

#[tauri::command]
fn logout(session: State<'_, Mutex<Option<UserSession>>>) -> Result<(), UserFacingError> {
  let mut session = session.lock()?;
  log::info!("Logging out, logged_in={}", session.is_some());
  *session = None;
  Ok(())
}

#[tauri::command]
fn create_account(username: String, password: String, session: State<'_, Mutex<Option<UserSession>>>) -> Result<(), UserFacingError> {
  log::info!("Creating account, username={username}");
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
  SimpleLogger::new()
    .with_level(if cfg!(debug_assertions) { LevelFilter::Debug } else { LevelFilter::Info })
    .with_colors(true)
    .with_utc_timestamps()
    .init()
    .expect("coud not initialize logger");

  if !APP_FOLDER.exists() {
    fs::create_dir(&*APP_FOLDER).expect("could not create app folder");
  }

  let context = tauri::generate_context!();
  tauri::Builder::default()
    .menu(tauri::Menu::os_default(&context.package_info().name))
    .manage(Mutex::<Option<UserSession>>::default())
    .invoke_handler(tauri::generate_handler![
      create_account,
      login,
      logout,
      fetch_credentials,
      add_credentials,
      remove_credentials,
      generate_password,
      copy_to_clipboard,
    ])
    .run(context)
    .expect("error while running tauri application");
}
