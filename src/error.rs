use serde::{Serialize, ser::SerializeMap};
use crate::logs;

#[derive(Debug, Clone, Copy)]
pub enum Error {
  InvalidCredentials,
  InvalidDatabase,
  InvalidParameter,
  UsernameTaken,
  Unexpected,
}

impl Error {
  fn message(&self) -> &'static str {
    match self {
      Self::InvalidCredentials => "invalid credentials",
      Self::InvalidDatabase => "corrupt key database",
      Self::InvalidParameter => "invalid parameter",
      Self::UsernameTaken => "username already registered",
      Self::Unexpected => "unexpected error occurred"
    }
  }

  fn key(&self) -> &'static str {
    match self {
      Self::InvalidCredentials => "invalid_credentials",
      Self::InvalidDatabase => "invalid_database",
      Self::InvalidParameter => "invalid_parameter",
      Self::UsernameTaken => "username_taken",
      Self::Unexpected => "unexpected",
    }
  }
}

impl<T: std::error::Error> From<T> for Error {
  fn from(e: T) -> Self {
    logs::error!("Unexpected error", e);
    Self::Unexpected
  }
}

impl Serialize for Error {
  fn serialize<S: serde::Serializer>(&self, serializer: S) -> Result<S::Ok, S::Error> {
    let mut json_err = serializer.serialize_map(Some(2))?;
    json_err.serialize_entry("key", self.key())?;
    json_err.serialize_entry("error", self.message())?;
    json_err.end()
  }
}
