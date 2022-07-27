import { invoke, InvokeArgs } from '@tauri-apps/api/tauri';

export interface BackendError {
  key: "invalid_credentials" | "invalid_database" | "invalid_parameter" | "username_taken" | "unexpected"
  error: string
}

export interface CredentialsDatabase {
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
    return await invoke(fn, args) as T;
  } catch (e) {
    return e as BackendError;
  }
}

export const login = (username: string, password: string) => call('login', { username, password });

export const logout = () => call('logout');

export const create_account = (username: string, password: string) => call('create_account', { username, password });

export const fetch_credentials = () => call<CredentialsDatabase>('fetch_credentials');

export const add_credentials = (name: string, username: string, password: string) => call<CredentialsDatabase>('add_credentials', { name, username, password });

export const remove_credentials = (name: string) => call<CredentialsDatabase>('remove_credentials', { name });

export const generate_password = (length: number, types: string[]) => call<string>('generate_password', { length, types });

export const copy_to_clipboard = (text: string) => call('copy_to_clipboard', { text });
