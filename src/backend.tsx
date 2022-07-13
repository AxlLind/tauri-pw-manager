import { invoke } from '@tauri-apps/api/tauri';

type Result<Value extends string, T> = { [P in Value]: T } | { err: string };

async function login(username: string, password: string): Promise<string | undefined> {
  try {
    await invoke('login', { username, password });
  } catch (e) {
    return e as string;
  }
}

async function create_account(username: string, password: string): Promise<string | undefined> {
  try {
    await invoke('create_account', { username, password });
  } catch (e) {
    return e as string;
  }
}

export { login, create_account };
