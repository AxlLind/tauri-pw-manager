import { useEffect } from 'react';
import { useRecoilState } from 'recoil';
import { AppBar, Toolbar, Button } from '@mui/material';
import { pageState } from './state';

export function useAsyncEffect(effect: () => Promise<any>, deps: any[]) {
  useEffect(() => { effect().catch(console.error); }, deps)
}

export function AppHeader() {
  const [, goToPage] = useRecoilState(pageState);
  return (
    <AppBar position='static'>
      <Toolbar>
        <h5 style={{ flexGrow: 1 }}>Tauri PW manager</h5>
        <Button onClick={() => goToPage('login')}>Logout</Button>
      </Toolbar>
    </AppBar>
  )
}
