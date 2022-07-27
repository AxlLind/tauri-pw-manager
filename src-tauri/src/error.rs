use std::error::Error;
use serde::{Serialize, ser::SerializeMap};

#[derive(Debug, Clone)]
pub enum UserFacingError {
  InvalidCredentials,
  InvalidDatabase,
  InvalidParameter,
  UsernameTaken,
  Unexpected,
}

impl UserFacingError {
  fn message(&self) -> &'static str {
    match self {
      UserFacingError::InvalidCredentials => "invalid credentials",
      UserFacingError::InvalidDatabase => "corrupt key database",
      UserFacingError::InvalidParameter => "invalid parameter",
      UserFacingError::UsernameTaken => "username already registered",
      UserFacingError::Unexpected => "unexpected error occurred"
    }
  }

  fn key(&self) -> &'static str {
    match self {
      UserFacingError::InvalidCredentials => "invalid_credentials",
      UserFacingError::InvalidDatabase => "invalid_database",
      UserFacingError::InvalidParameter => "invalid_parameter",
      UserFacingError::UsernameTaken => "username_taken",
      UserFacingError::Unexpected => "unexpected",
    }
  }
}

impl<T: Error> From<T> for UserFacingError {
  fn from(e: T) -> Self {
    log::error!("{}", e);
    UserFacingError::Unexpected
  }
}

impl Serialize for UserFacingError {
  fn serialize<S: serde::Serializer>(&self, serializer: S) -> Result<S::Ok, S::Error> {
    let mut json_err = serializer.serialize_map(Some(2))?;
    json_err.serialize_entry("key", self.key())?;
    json_err.serialize_entry("error", self.message())?;
    json_err.end()
  }
}
