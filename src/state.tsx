import { atom } from "recoil";

const pageState = atom({
  key: 'page',
  default: 'login',
});

export { pageState };
