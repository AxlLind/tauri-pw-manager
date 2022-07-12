use openssl::{hash::MessageDigest, error::ErrorStack, symm::{encrypt_aead, Cipher, decrypt_aead}, rand::rand_bytes};

#[derive(Debug, Default, Clone)]
pub struct EncryptedBlob {
  iv: [u8; 12],
  tag: [u8; 16],
  data: Vec<u8>,
}

impl EncryptedBlob {
  pub fn from_bytes(bytes: &[u8]) -> Option<Self> {
    if bytes.len() < (12 + 16 + 1) {
      return None;
    }
    let mut blob = Self::default();
    blob.iv.copy_from_slice(&bytes[0..12]);
    blob.tag.copy_from_slice(&bytes[12..12+16]);
    blob.data = bytes[12+16..].to_vec();
    Some(blob)
  }

  pub fn to_vec(&self) -> Vec<u8> {
    self.iv.iter()
      .chain(self.tag.iter())
      .chain(self.data.iter())
      .copied()
      .collect()
  }
}

pub fn encrypt(key: &[u8], data: &[u8]) -> Result<EncryptedBlob, ErrorStack> {
  let iv = random_bytes::<12>();
  let mut tag = [0; 16];
  encrypt_aead(Cipher::aes_256_gcm(), key, Some(&iv), &[], data, &mut tag)
    .map(|v| EncryptedBlob {
      iv,
      tag,
      data: v
    })
}

pub fn decrypt(key: &[u8], blob: &EncryptedBlob) -> Result<Vec<u8>, ErrorStack> {
  decrypt_aead(Cipher::aes_256_gcm(), key, Some(&blob.iv), &[], &blob.data, &blob.tag)
}

pub fn random_bytes<const SIZE: usize>() -> [u8; SIZE] {
  let mut bytes = [0; SIZE];
  rand_bytes(&mut bytes).expect("failed to generate random bytes");
  bytes
}

pub fn pbkdf2_hmac(password: &[u8], salt: &[u8]) -> Result<[u8; 32], ErrorStack> {
  let mut key = [0; 32];
  openssl::pkcs5::pbkdf2_hmac(password, salt, 100_000, MessageDigest::sha256(), &mut key).map(|_| key)
}

#[cfg(test)]
mod tests {
  use super::*;

  #[test]
  fn test_encrypt_decrypt_lob() {
    let data = b"This is some serious data right here";
    let key = random_bytes::<32>();
    let blob1 = encrypt(&key, data).expect("this should encrypt");
    let blob2 = encrypt(&key, data).expect("this should encrypt");
    assert_eq!(blob1.data.len(), data.len());

    // encrypted with two random ivs
    assert_ne!(blob1.iv, blob2.iv);
    assert_ne!(blob1.data, blob2.data);
    assert_ne!(blob1.tag, blob2.tag);

    let decrypted_data1 = decrypt(&key, &blob1).expect("this should decrypt");
    let decrypted_data2 = decrypt(&key, &blob2).expect("this should decrypt");
    assert_eq!(decrypted_data1, data);
    assert_eq!(decrypted_data2, data);
  }

  #[test]
  fn test_pbkdf2_hmac() {
    let password = b"MargaretThatcheris110%SEXY";
    let salt = b"yellow_submarine";
    assert!(pbkdf2_hmac(password, salt).is_ok());
  }
}
