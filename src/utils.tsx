import { useEffect } from 'react';
import { useRecoilState } from 'recoil';
import { AppBar, Toolbar, IconButton } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { pageState } from './state';

export type Page = 'login' | 'signup' | 'start' | 'add';

export function useAsyncEffect(effect: () => Promise<any>, deps: any[]) {
  useEffect(() => { effect().catch(console.error); }, deps)
}

export function AppHeader({ backPage }: { backPage: Page }) {
  const [, goToPage] = useRecoilState(pageState);
  return (
    <AppBar position='static'>
      <Toolbar>
        <IconButton edge='start' onClick={() => goToPage(backPage)}>
          <ArrowBackIcon/>
        </IconButton>
        <h4>Tauri PW manager</h4>
      </Toolbar>
    </AppBar>
  )
}
