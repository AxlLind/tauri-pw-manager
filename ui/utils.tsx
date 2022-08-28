import { useEffect, useState, createContext } from 'react';
import { IconButton, AlertColor, TextField, InputAdornment, Tooltip, createSvgIcon } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';

export type Page = 'login' | 'signup' | 'start' | 'add';

export type PageProps = { goToPage: (p: Page) => void, showAlert: (m: string, severity?: AlertColor) => void };

export const PageContext = createContext<PageProps>({} as PageProps);

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

export const AppIcon = createSvgIcon(<path d="M5.988.484 0 11.25l6 10.5h12.024l5.978-10.5L18.012.484H5.988zm.882 1.5h10.26l4.735 8.512h-5.076l-2.173-3.907H9.383L7.21 10.496H2.135L6.87 1.985zm8.622 9.266-1.758 3.161h-3.469L8.507 11.25l1.758-3.161h3.469l1.758 3.161zm1.638 9.266H6.87l-4.739-8.52h5.075l2.177 3.914h5.233l2.177-3.914h5.076l-4.739 8.52z"/>, 'App');
