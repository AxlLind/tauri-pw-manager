import { useEffect, useState } from 'react';
import { AppBar, Toolbar, IconButton, AlertColor, Typography, TextField, InputAdornment } from '@mui/material';
import { ArrowBack, Visibility, VisibilityOff } from '@mui/icons-material';

export type Page = 'login' | 'signup' | 'start' | 'add';

export type PageProps = { goToPage: (p: Page) => void, showAlert: (message: string, severity?: AlertColor) => void };

export function useAsyncEffect(effect: () => Promise<any>, deps: any[]) {
  useEffect(() => { effect().catch(console.error); }, deps)
}

export const AppHeader = ({ goToPage, backPage }: { goToPage: (p: Page) => void, backPage: Page }) => (
  <AppBar position='static'>
    <Toolbar>
      <IconButton children={<ArrowBack/>} edge='start' onClick={() => goToPage(backPage)}/>
      <Typography>Tauri PW manager</Typography>
    </Toolbar>
  </AppBar>
);

export function PasswordField({ label, value, onChange }: { label: string, value: string, onChange: (s: string) => void}) {
  const [show, setShow] = useState(false);
  const endAdornment = (
    <InputAdornment position="end">
      <IconButton children={show ? <VisibilityOff/> : <Visibility/>} onClick={() => setShow(!show)} edge="end"/>
    </InputAdornment>
  );
  return <TextField label={label} value={value} onChange={e => onChange(e.target.value)} type={show ? 'text' : 'password'} InputProps={{ endAdornment }}/>;
}
