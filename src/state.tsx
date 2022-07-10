import { atom } from "recoil";

const pageState = atom({ key: 'page', default: 'login' });

const tokenState = atom({ key: 'session_token', default: null as (string | null) });

export { pageState, tokenState };
