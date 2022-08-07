use std::fs;
use std::path::Path;
use log::LevelFilter;
use chrono::{Duration, Local, NaiveDate};
use crate::error::Error;

pub fn initialize(logs_folder: &Path) -> Result<(), Error> {
  if !logs_folder.exists() {
    fs::create_dir(&logs_folder)?;
  }
  let log_file = Local::now().format("%Y-%m-%d.log").to_string();
  fern::Dispatch::new()
    .format(|out, message, record| {
      out.finish(format_args!(
        "[{}][{}] {}",
        Local::now().format("%Y-%m-%d %H:%M:%S"),
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

pub fn remove_old(log_folder: &Path) -> Result<(), Error> {
  let deletion_point = Local::now().naive_local() - Duration::days(3);
  for e in fs::read_dir(log_folder)? {
    let path = e?.path();
    if !path.is_file() || path.extension().map_or(false, |e| e != "log") {
      continue;
    }
    let file_stem = path.file_stem().unwrap().to_string_lossy();
    let log_time = match NaiveDate::parse_from_str(&file_stem, "%Y-%m-%d") {
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

#[cfg(test)]
mod tests {
  use super::*;
  use tempfile::tempdir;

  #[test]
  fn test_remove_old() -> std::io::Result<()> {
    let dir = tempdir()?;
    let now = Local::now().naive_local();
    for days_old in 0..5 {
      let log = dir.path().join((now - Duration::days(days_old)).format("%Y-%m-%d.log").to_string());
      fs::write(&log, "unittest")?;
    }
    assert_eq!(fs::read_dir(dir.path())?.count(), 5);
    remove_old(dir.path()).unwrap();
    assert_eq!(fs::read_dir(dir.path())?.count(), 3);

    // only '.log' should be removed
    fs::write(dir.path().join("1984-01-01.txt"), "unittest")?;
    remove_old(dir.path()).unwrap();
    assert_eq!(fs::read_dir(dir.path())?.count(), 4);
    Ok(())
  }
}
