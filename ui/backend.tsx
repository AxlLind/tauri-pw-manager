import { invoke, InvokeArgs } from '@tauri-apps/api/tauri';

export type Credentials = { username: string, password: string };

async function call<T = undefined>(fn: string, args?: InvokeArgs): Promise<{ ok: true; value: T } | { ok: false; error: string }> {
  try {
    return { ok: true, value: await invoke<T>(fn, args) };
  } catch (e: any) {
    return { ok: false, error: e.error };
  }
}

export const login = (username: string, password: string) => call('login', { username, password });
export const logout = () => call('logout');
export const create_account = (username: string, password: string) => call('create_account', { username, password });
export const fetch_credentials = () => call<string[]>('fetch_credentials');
export const add_credentials = (name: string, username: string, password: string) => call('add_credentials', { name, username, password });
export const remove_credentials = (name: string) => call('remove_credentials', { name });
export const get_credentials_info = (name: string) => call<Credentials>('get_credentials_info', { name });
export const generate_password = (length: number, types: string[]) => call<string>('generate_password', { length, types });
export const copy_to_clipboard = (name: string, thing: 'username' | 'password') => call('copy_to_clipboard', { name, thing });
export const window_close = () => call('window_close');
export const window_minimize = () => call('window_minimize');
export const window_toggle_maximized = () => call('window_toggle_maximized');
