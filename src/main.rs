#![forbid(unsafe_code)]
#![cfg_attr(all(not(debug_assertions), target_os = "windows"), windows_subsystem = "windows")]
mod database;
mod cryptography;
mod error;

use std::fs;
use std::path::PathBuf;
use std::sync::Mutex;
use once_cell::sync::Lazy;
use arboard::Clipboard;
use tauri::State;
use log::LevelFilter;
use simple_logger::SimpleLogger;
use crate::cryptography::EncryptedBlob;
use crate::database::CredentialsDatabase;
use crate::error::Error;

static APP_FOLDER: Lazy<PathBuf> = Lazy::new(|| {
  let base_folder = if cfg!(target_os = "windows") {
    std::env::var("APPDATA").expect("$APPDATA not set!")
  } else {
    std::env::var("HOME").expect("$HOME not set!")
  };
  [&base_folder, ".tauri-pw-manager"].iter().collect()
});

fn user_db_file(username: &str) -> PathBuf {
  APP_FOLDER.join(format!("{username}.pwdb"))
}

#[derive(Debug, Default)]
struct UserSession {
  file: PathBuf,
  salt: [u8; 12],
  nonce: [u8; 16],
  encrypted_key: [u8; 32],
  key: [u8; 32],
  db: CredentialsDatabase,
}

fn save_database(session: &UserSession) -> Result<(), Error> {
  let encrypted_blob = EncryptedBlob::encrypt(&session.db, &session.key)?;
  let file_content = session.salt.iter()
    .copied()
    .chain(session.nonce)
    .chain(session.encrypted_key)
    .chain(encrypted_blob.bytes())
    .collect::<Vec<_>>();
  fs::write(&session.file, &file_content)?;
  Ok(())
}

#[tauri::command]
fn copy_to_clipboard(text: String) -> Result<(), Error> {
  Clipboard::new()?.set_text(text)?;
  Ok(())
}

#[tauri::command]
fn generate_password(length: usize, types: Vec<String>) -> Result<String, Error> {
  log::debug!("Generating password: types={:?}", types);
  if types.is_empty() {
    return Err(Error::InvalidParameter);
  }
  if !(10..=128).contains(&length) {
    return Err(Error::InvalidParameter);
  }
  let alphabet = types.iter()
    .map(|t| match t.as_str() {
      "lowercase" => Ok("abcdefghijklmnopqrstuvwxyz"),
      "uppercase" => Ok("ABCDEFGHIJKLMNOPQRSTUVWXYZ"),
      "digits"    => Ok("0123456789"),
      "special"   => Ok("!@#$%^&*"),
      _ => Err(Error::InvalidParameter),
    })
    .collect::<Result<Vec<_>,_>>()?
    .join("");
  Ok(cryptography::generate_password(alphabet.as_bytes(), length))
}

#[tauri::command]
fn fetch_credentials(session_mutex: State<'_, Mutex<Option<UserSession>>>) -> Result<CredentialsDatabase, Error> {
  log::debug!("Fetching credentials");
  let session_guard = session_mutex.lock()?;
  let session = session_guard.as_ref().ok_or(Error::InvalidCredentials)?;
  Ok(session.db.clone())
}

#[tauri::command]
fn remove_credentials(name: String, session_mutex: State<'_, Mutex<Option<UserSession>>>) -> Result<CredentialsDatabase, Error> {
  log::info!("Removing credentials, name={name}");
  let mut session_guard = session_mutex.lock()?;
  let session = session_guard.as_mut().ok_or(Error::InvalidCredentials)?;
  if !session.db.remove(&name) {
    return Err(Error::InvalidParameter);
  }
  save_database(session)?;
  Ok(session.db.clone())
}

#[tauri::command]
fn add_credentials(name: String, username: String, password: String, session_mutex: State<'_, Mutex<Option<UserSession>>>) -> Result<CredentialsDatabase, Error> {
  log::info!("Adding credential, name={name}");
  if name.is_empty() || username.is_empty() || password.is_empty() {
    return Err(Error::InvalidCredentials);
  }
  let mut session_guard = session_mutex.lock()?;
  let session = session_guard.as_mut().ok_or(Error::InvalidCredentials)?;
  session.db.add(name, username, password);
  save_database(session)?;
  Ok(session.db.clone())
}

#[tauri::command]
fn logout(session: State<'_, Mutex<Option<UserSession>>>) -> Result<(), Error> {
  let mut session = session.lock()?;
  log::info!("Logging out, logged_in={}", session.is_some());
  *session = None;
  Ok(())
}

#[tauri::command]
fn login(username: String, password: String, session: State<'_, Mutex<Option<UserSession>>>) -> Result<(), Error> {
  log::info!("Logging in, username={username}");
  if username.is_empty() || password.is_empty() {
    return Err(Error::InvalidCredentials);
  }
  let mut session = session.lock()?;
  if session.is_some() {
    return Err(Error::Unexpected);
  }
  let file = user_db_file(&username);
  if !file.exists() {
    return Err(Error::InvalidCredentials);
  }
  let file_contents = fs::read(&file)?;
  if file_contents.len() < 12+16+32+1 {
    return Err(Error::InvalidDatabase);
  }
  let salt: [u8; 12] = file_contents[..12].try_into().unwrap();
  let nonce: [u8; 16] = file_contents[12..12+16].try_into().unwrap();
  let encrypted_key: [u8; 32] = file_contents[12+16..12+16+32].try_into().unwrap();
  let master_key = cryptography::pbkdf2_hmac(password.as_bytes(), &salt);
  let key = cryptography::decrypt_key(&master_key, &encrypted_key, &nonce).map_err(|_| Error::InvalidCredentials)?;
  let db: CredentialsDatabase = EncryptedBlob::from_bytes(&file_contents[12+16+32..])?
    .decrypt(&key)
    .map_err(|_| Error::InvalidCredentials)?;
  if db.username() != username {
    return Err(Error::InvalidDatabase);
  }
  *session = Some(UserSession { file, salt, nonce, encrypted_key, key, db });
  Ok(())
}

#[tauri::command]
fn create_account(username: String, password: String, session: State<'_, Mutex<Option<UserSession>>>) -> Result<(), Error> {
  log::info!("Creating account, username={username}");
  if username.is_empty() || password.is_empty() {
    return Err(Error::InvalidCredentials);
  }
  let mut session = session.lock()?;
  if session.is_some() {
    return Err(Error::Unexpected);
  }
  let file = user_db_file(&username);
  if file.exists() {
    return Err(Error::UsernameTaken);
  }
  let salt = cryptography::random_bytes::<12>();
  let master_key = cryptography::pbkdf2_hmac(password.as_bytes(), &salt);
  let key = cryptography::random_bytes::<32>();
  let (encrypted_key, nonce) = cryptography::encrypt_key(&master_key, &key)?;
  let db = CredentialsDatabase::new(username.clone());
  *session = Some(UserSession { file, salt, nonce, encrypted_key, key, db });
  save_database(&session.as_ref().unwrap())?;
  Ok(())
}

fn main() {
  SimpleLogger::new()
    .with_level(if cfg!(debug_assertions) { LevelFilter::Debug } else { LevelFilter::Info })
    .with_colors(true)
    .with_utc_timestamps()
    .init()
    .expect("could not initialize logger");

  if !APP_FOLDER.exists() {
    fs::create_dir(&*APP_FOLDER).expect("could not create app folder");
  }

  let context = tauri::generate_context!();
  tauri::Builder::default()
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
    .menu(if cfg!(target_os = "macos") {
      tauri::Menu::os_default(&context.package_info().name)
    } else {
      tauri::Menu::default()
    })
    .run(context)
    .expect("error while running tauri application");
}
