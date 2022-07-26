import { useEffect } from 'react';
import { AppBar, Toolbar, IconButton } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

export type Page = 'login' | 'signup' | 'start' | 'add';

export function useAsyncEffect(effect: () => Promise<any>, deps: any[]) {
  useEffect(() => { effect().catch(console.error); }, deps)
}

export const AppHeader = ({ goToPage, backPage }: { goToPage: (p: Page) => void, backPage: Page }) => (
  <AppBar position='static'>
    <Toolbar>
      <IconButton edge='start' onClick={() => goToPage(backPage)}>
        <ArrowBackIcon/>
      </IconButton>
      <h4>Tauri PW manager</h4>
    </Toolbar>
  </AppBar>
)
