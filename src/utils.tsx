import { useEffect } from 'react';
import { AppBar, Toolbar, IconButton, AlertColor, Typography } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

export type Page = 'login' | 'signup' | 'start' | 'add';

export type Message = { message?: string, severity?: AlertColor };

export type PageProps = { goToPage: (p: Page) => void, showAlert: (e: string | Message) => void };

export function useAsyncEffect(effect: () => Promise<any>, deps: any[]) {
  useEffect(() => { effect().catch(console.error); }, deps)
}

export const AppHeader = ({ goToPage, backPage }: { goToPage: (p: Page) => void, backPage: Page }) => (
  <AppBar position='static'>
    <Toolbar>
      <IconButton children={<ArrowBackIcon/>} edge='start' onClick={() => goToPage(backPage)}/>
      <Typography>Tauri PW manager</Typography>
    </Toolbar>
  </AppBar>
)
