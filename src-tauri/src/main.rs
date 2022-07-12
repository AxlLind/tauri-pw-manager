#![cfg_attr(
  all(not(debug_assertions), target_os = "windows"),
  windows_subsystem = "windows"
)]
mod database;
mod cryptography;

#[tauri::command]
fn login(email: String, password: String) -> String {
  println!("Logging in, email={email}, password={password}");
  "session_token".to_string()
}

#[tauri::command]
fn create_account(email: String, password: String) -> String {
  println!("Creating account, email={email}, password={password}");
  "session_token".to_string()
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
