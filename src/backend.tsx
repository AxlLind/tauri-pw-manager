import { invoke, InvokeArgs } from '@tauri-apps/api/tauri';

interface BackendError {
  key: "invalid_credentials" | "invalid_database" | "username_taken" | "unexpected"
  error: string
}

async function call<T = undefined>(fn: string, args?: InvokeArgs): Promise<T | BackendError> {
  try {
    return await invoke(fn, args);
  } catch (e) {
    return e as BackendError;
  }
}

const login = (username: string, password: string) => call('login', { username, password });

const create_account = (username: string, password: string) => call('create_account', { username, password });

export { login, create_account };
