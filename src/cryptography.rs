use std::marker::PhantomData;
use openssl::error::ErrorStack;
use openssl::hash::MessageDigest;
use openssl::rand::rand_bytes;
use openssl::symm::{Cipher, encrypt_aead, decrypt_aead, encrypt, decrypt};
use serde::{Serialize, de::DeserializeOwned};
use crate::error::UserFacingError;

const AAD_MESSAGE: &[u8] = b"Tauri PW Manager v0.0.1";

#[derive(Debug, Default, Clone)]
pub struct EncryptedBlob<T> {
  iv: [u8; 12],
  tag: [u8; 16],
  data: Vec<u8>,
  _t: PhantomData<T>,
}

impl<T: Serialize + DeserializeOwned> EncryptedBlob<T> {
  pub fn encrypt(t: &T, key: &[u8]) -> Result<Self, UserFacingError> {
    let iv = random_bytes::<12>();
    let mut tag = [0; 16];
    let serialized = serde_json::to_vec(&t)?;
    let data = encrypt_aead(Cipher::aes_256_gcm(), key, Some(&iv), AAD_MESSAGE, &serialized, &mut tag)?;
    Ok(Self { iv, tag, data, _t: PhantomData })
  }

  pub fn decrypt(&self, key: &[u8]) -> Result<T, UserFacingError> {
    let bytes = decrypt_aead(Cipher::aes_256_gcm(), key, Some(&self.iv), AAD_MESSAGE, &self.data, &self.tag)?;
    let t = serde_json::from_slice(&bytes)?;
    Ok(t)
  }

  pub fn from_bytes(bytes: &[u8]) -> Result<Self, UserFacingError> {
    if bytes.len() < (12 + 16 + 1) {
      return Err(UserFacingError::InvalidDatabase);
    }
    Ok(Self {
      iv: bytes[0..12].try_into().unwrap(),
      tag: bytes[12..12+16].try_into().unwrap(),
      data: bytes[12+16..].to_vec(),
      _t: PhantomData,
    })
  }

  pub fn bytes(&self) -> impl Iterator<Item=u8> + '_ {
    self.iv.iter().chain(self.tag.iter()).chain(self.data.iter()).copied()
  }
}

pub fn random_bytes<const SIZE: usize>() -> [u8; SIZE] {
  let mut bytes = [0; SIZE];
  rand_bytes(&mut bytes).expect("failed to generate random bytes");
  bytes
}

pub fn pbkdf2_hmac(password: &[u8], salt: &[u8]) -> [u8; 32] {
  let mut key = [0; 32];
  openssl::pkcs5::pbkdf2_hmac(password, salt, 100_000, MessageDigest::sha256(), &mut key).expect("pbkdf2 should not fail");
  key
}

pub fn encrypt_key(master_key: &[u8], key: &[u8]) -> Result<([u8; 32], [u8; 16]), ErrorStack> {
  let nonce = random_bytes::<16>();
  let ciphertext = encrypt(Cipher::aes_256_ctr(), master_key, Some(&nonce), key)?;
  Ok((ciphertext.try_into().unwrap(), nonce))
}

pub fn decrypt_key(master_key: &[u8], encrypted_key: &[u8], nonce: &[u8]) -> Result<[u8; 32], ErrorStack> {
  let plaintext = decrypt(Cipher::aes_256_ctr(), master_key, Some(nonce), encrypted_key)?;
  Ok(plaintext.try_into().unwrap())
}

pub fn generate_password(alphabet: &[u8], len: usize) -> String {
  assert!(alphabet.len() < 256);
  let mod_ceil = alphabet.len().next_power_of_two();
  (0..len).map(|_| loop {
    let [b] = random_bytes::<1>();
    if let Some(&c) = alphabet.get(b as usize % mod_ceil) {
      return c as char;
    }
  }).collect()
}

#[cfg(test)]
mod tests {
  use super::*;

  #[test]
  fn test_encrypt_decrypt_lob() {
    let data = "This is some serious data right here".to_string();
    let key = random_bytes::<32>();
    let blob1 = EncryptedBlob::encrypt(&data, &key).expect("this should encrypt");
    let blob2 = EncryptedBlob::encrypt(&data, &key).expect("this should encrypt");

    // encrypted with two random ivs
    assert_ne!(blob1.iv, blob2.iv);
    assert_ne!(blob1.data, blob2.data);
    assert_ne!(blob1.tag, blob2.tag);

    let decrypted_data1 = blob1.decrypt(&key).expect("this should decrypt");
    let decrypted_data2 = blob2.decrypt(&key).expect("this should decrypt");
    assert_eq!(decrypted_data1, data);
    assert_eq!(decrypted_data2, data);

    // a single bit flip should mean failure
    let mut blob = EncryptedBlob::encrypt(&data, &key).expect("this should encrypt");
    blob.data[4] += 1;
    assert!(blob.decrypt(&key).is_err());
  }

  #[test]
  fn test_blob_to_from_vec() {
    let bytes = random_bytes::<128>().to_vec();
    let blob = EncryptedBlob::<Vec<u8>>::from_bytes(&bytes).expect("should be convertable");
    assert_eq!(bytes, blob.bytes().collect::<Vec<_>>());

    let too_few_bytes = [0; 28];
    assert!(EncryptedBlob::<Vec<u8>>::from_bytes(&too_few_bytes).is_err());
  }

  #[test]
  fn test_generate_password() {
    assert_eq!(generate_password(b"a", 5), "aaaaa");

    const ASCII_PRINTABLE: &[u8] = b"0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ!\"#$%&\'()*+,-./:;<=>?@[\\]^_`{|}~";
    let pw = generate_password(ASCII_PRINTABLE, 2000);
    for c in pw.bytes() {
      assert!(ASCII_PRINTABLE.contains(&c));
    }
    assert_eq!(pw.len(), 2000);
  }
}
