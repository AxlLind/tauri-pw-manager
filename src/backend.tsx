import { invoke, InvokeArgs } from '@tauri-apps/api/tauri';

interface BackendError {
  key: "invalid_credentials" | "invalid_database" | "username_taken" | "unexpected"
  error: string
}

export type CredentialsDatabase = {
  username: string,
  credentials: {
    [key: string]: {
      username: string,
      password: string,
    }
  }
};

async function call<T = undefined>(fn: string, args?: InvokeArgs): Promise<T | BackendError> {
  try {
    return await invoke(fn, args);
  } catch (e) {
    return e as BackendError;
  }
}

const login = (username: string, password: string) => call('login', { username, password });

const logout = () => call('logout');

const create_account = (username: string, password: string) => call('create_account', { username, password });

const fetch_credentials = () => call<CredentialsDatabase>('fetch_credentials');

const add_credentials = (name: string, username: string, password: string) => call('add_credentials', {name, username, password});

// export as an object to enforce 'backend.function_call'
export const backend = { login, logout, create_account, fetch_credentials, add_credentials };
