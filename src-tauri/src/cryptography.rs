use openssl::{hash::MessageDigest, error::ErrorStack, symm::{encrypt_aead, Cipher, decrypt_aead}, rand::rand_bytes};

const AAD_MESSAGE: &[u8] = b"Tauri PW Manager v0.0.1";

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

  pub fn iter(&self) -> impl Iterator<Item=u8> + '_ {
    self.iv.iter().chain(self.tag.iter()).chain(self.data.iter()).copied()
  }
}

pub fn encrypt(key: &[u8], data: &[u8]) -> Result<EncryptedBlob, ErrorStack> {
  let iv = random_bytes::<12>();
  let mut tag = [0; 16];
  encrypt_aead(Cipher::aes_256_gcm(), key, Some(&iv), AAD_MESSAGE, data, &mut tag)
    .map(|v| EncryptedBlob {
      iv,
      tag,
      data: v
    })
}

pub fn decrypt(key: &[u8], blob: &EncryptedBlob) -> Result<Vec<u8>, ErrorStack> {
  decrypt_aead(Cipher::aes_256_gcm(), key, Some(&blob.iv), AAD_MESSAGE, &blob.data, &blob.tag)
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
  fn test_blob_to_from_vec() {
    let bytes = random_bytes::<128>().to_vec();
    let blob = EncryptedBlob::from_bytes(&bytes).expect("should be convertable");
    assert_eq!(bytes, blob.iter().collect::<Vec<_>>());

    let too_few_bytes = [0; 28];
    assert!(EncryptedBlob::from_bytes(&too_few_bytes).is_none());
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
