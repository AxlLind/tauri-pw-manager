use std::collections::HashMap;
use serde::{Serialize, Deserialize};

#[derive(Default, Debug, Hash, Serialize, Deserialize, Clone)]
pub struct Credential {
  pub username: String,
  pub password: String,
}

#[derive(Default, Debug, Serialize, Deserialize)]
pub struct CredentialsDatabase {
  username: String,
  credentials: HashMap<String, Credential>
}

impl CredentialsDatabase {
  pub fn new(username: String) -> Self {
    Self { username, ..Self::default() }
  }

  pub fn username(&self) -> &str { &self.username }

  pub fn add(&mut self, name: String, username: String, password: String) {
    self.credentials.insert(name, Credential { username, password });
  }

  pub fn remove(&mut self, name: &str) -> bool {
    self.credentials.remove(name).is_some()
  }
}
