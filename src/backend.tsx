import { invoke } from '@tauri-apps/api/tauri';

interface BackendError {
  key: "invalid_credentials" | "invalid_database" | "username_taken" | "unexpected"
  message: string
}

type Result<Value extends string, T> = { [P in Value]: T } | BackendError;

async function login(username: string, password: string): Promise<BackendError | undefined> {
  try {
    await invoke('login', { username, password });
  } catch (e) {
    return e as BackendError;
  }
}

async function create_account(username: string, password: string): Promise<BackendError | undefined> {
  try {
    await invoke('create_account', { username, password });
  } catch (e) {
    return e as BackendError;
  }
}

export { login, create_account };
