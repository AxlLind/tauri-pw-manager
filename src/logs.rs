use std::fs;
use log::LevelFilter;
use crate::APP_FOLDER;
use crate::error::Error;

pub fn initialize() -> Result<(), Error> {
  let logs_folder = APP_FOLDER.join("logs");
  if !logs_folder.exists() {
    fs::create_dir(&logs_folder)?;
  }
  let log_file = chrono::Local::now().format("%Y-%m-%d.log").to_string();
  fern::Dispatch::new()
    .format(|out, message, record| {
      out.finish(format_args!(
        "[{}][{}] {}",
        chrono::Local::now().format("%Y-%m-%d %H:%M:%S"),
        record.level(),
        message,
      ))
    })
    .level(if cfg!(debug_assertions) { log::LevelFilter::Debug } else { LevelFilter::Info })
    .chain(std::io::stdout())
    .chain(fern::log_file(logs_folder.join(log_file))?)
    .apply()?;
  Ok(())
}

pub fn remove_old() -> Result<(), Error> {
  let deletion_point = chrono::Local::now().naive_local() - chrono::Duration::days(3);
  for e in fs::read_dir(APP_FOLDER.join("logs"))? {
    let path = e?.path();
    if !path.is_file() || path.extension().map_or(false, |e| e != "log") {
      continue;
    }
    let file_stem = path.file_stem().unwrap().to_string_lossy();
    let log_time = match chrono::NaiveDate::parse_from_str(&file_stem, "%Y-%m-%d") {
      Ok(d) => d.and_hms(0, 0, 0),
      Err(_) => continue,
    };
    if log_time < deletion_point {
      log::info!("removing old log file: file={}", path.file_name().unwrap().to_string_lossy());
      fs::remove_file(path)?;
    }
  }
  Ok(())
}
