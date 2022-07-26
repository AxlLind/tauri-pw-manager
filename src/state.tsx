import { atom } from "recoil";

export const pageState = atom({ key: 'page', default: 'login' as 'login' | 'signup' | 'start' });
