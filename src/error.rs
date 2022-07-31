use serde::{Serialize, ser::SerializeMap};

#[derive(Debug, Clone)]
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
      Error::InvalidCredentials => "invalid credentials",
      Error::InvalidDatabase => "corrupt key database",
      Error::InvalidParameter => "invalid parameter",
      Error::UsernameTaken => "username already registered",
      Error::Unexpected => "unexpected error occurred"
    }
  }

  fn key(&self) -> &'static str {
    match self {
      Error::InvalidCredentials => "invalid_credentials",
      Error::InvalidDatabase => "invalid_database",
      Error::InvalidParameter => "invalid_parameter",
      Error::UsernameTaken => "username_taken",
      Error::Unexpected => "unexpected",
    }
  }
}

impl<T: std::error::Error> From<T> for Error {
  fn from(e: T) -> Self {
    log::error!("Unexpected error: {}", e);
    Error::Unexpected
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
