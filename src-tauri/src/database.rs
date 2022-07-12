use std::collections::{HashMap, hash_map::Entry};
use serde::{Serialize, Deserialize};

#[derive(Default, Debug, Hash, Serialize, Deserialize, Clone)]
pub struct Credential {
  pub username: String,
  pub password: String,
}

#[derive(Default, Debug, Serialize, Deserialize)]
pub struct CredentialsDatabase {
  email: String,
  credentials: HashMap<String, Credential>
}

impl CredentialsDatabase {
  pub fn new(email: String) -> Self {
    Self { email, ..Self::default() }
  }

  pub fn entry(&self, name: &str) -> Option<&Credential> {
    self.credentials.get(name)
  }

  pub fn add(&mut self, name: String, username: String, password: String) -> bool {
    match self.credentials.entry(name) {
      Entry::Occupied(_) => false,
      Entry::Vacant(v) => {
        v.insert(Credential { username, password });
        true
      }
    }
  }
}
