use std::{fmt::Display, error::Error};
use serde::{Serialize, ser::SerializeMap};

#[derive(Debug, Clone)]
pub enum UserFacingError {
  InvalidCredentials,
  InvalidDatabase,
  UsernameTaken,
  Unexpected(&'static str),
}

impl UserFacingError {
  fn message(&self) -> &'static str {
    match self {
      UserFacingError::InvalidCredentials => "invalid credentials",
      UserFacingError::InvalidDatabase => "corrupt key database",
      UserFacingError::UsernameTaken => "username already registered",
      UserFacingError::Unexpected(reason) => reason,
    }
  }

  fn key(&self) -> &'static str {
    match self {
      UserFacingError::InvalidCredentials => "invalid_credentials",
      UserFacingError::InvalidDatabase => "invalid_database",
      UserFacingError::UsernameTaken => "username_taken",
      UserFacingError::Unexpected(_) => "unexpected",
    }
  }
}

impl Display for UserFacingError {
  fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
    write!(f, "{}", self.message())
  }
}

impl Error for UserFacingError {}

impl Serialize for UserFacingError {
  fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
      S: serde::Serializer {
    let mut json_err = serializer.serialize_map(Some(2))?;
    json_err.serialize_entry("key", self.key())?;
    json_err.serialize_entry("message", self.message())?;
    json_err.end()
  }
}
