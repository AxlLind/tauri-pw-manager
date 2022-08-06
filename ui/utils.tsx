import { useEffect, useState } from 'react';
import { IconButton, AlertColor, TextField, InputAdornment, Tooltip } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';

export type Page = 'login' | 'signup' | 'start' | 'add';

export type PageProps = { goToPage: (p: Page) => void, showAlert: (m: string, severity?: AlertColor) => void };

export function useAsyncEffect(effect: () => Promise<any>, deps: any[]) {
  useEffect(() => { effect().catch(console.error); }, deps)
}

export function PasswordField({ label, value, onChange }: { label: string, value: string, onChange: (s: string) => void}) {
  const [show, setShow] = useState(false);
  const endAdornment = (
    <InputAdornment position="end">
      <Tooltip title={show ? 'hide' : 'show'}>
        <IconButton children={show ? <VisibilityOff/> : <Visibility/>} tabIndex={-1} onClick={() => setShow(!show)} edge="end"/>
      </Tooltip>
    </InputAdornment>
  );
  return <TextField label={label} value={value} onChange={e => onChange(e.target.value)} type={show ? 'text' : 'password'} InputProps={{ endAdornment }}/>;
}
