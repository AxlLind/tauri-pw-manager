import { atom } from "recoil";
import { Page } from "./utils";

export const pageState = atom({ key: 'page', default: 'login' as Page });
