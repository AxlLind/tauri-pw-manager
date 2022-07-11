import { invoke } from '@tauri-apps/api/tauri';

type Result<Value extends string, T> = { [P in Value]: T } | { err: string };

async function login(email: string, password: string): Promise<Result<'token', string>> {
  try {
    const token: string = await invoke('login', { email, password });
    return { token };
  } catch (e) {
    return { err: e as string };
  }
}

async function create_account(email: string, password: string): Promise<Result<'token', string>> {
  try {
    const token: string = await invoke('create_account', { email, password });
    return { token };
  } catch (e) {
    return { err: e as string };
  }
}

export { login, create_account };
