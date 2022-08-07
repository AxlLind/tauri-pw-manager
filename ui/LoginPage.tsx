import { useState } from 'react';
import { Stack, Button, TextField, Typography } from '@mui/material';
import { useAsyncEffect, PageProps, PasswordField, AppIcon } from './utils';
import { login, logout } from './backend';

export function LoginPage({ goToPage, showAlert }: PageProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  useAsyncEffect(logout, []);

  const onClickLogin = async () => {
    if (username === '') return showAlert('Username missing.');
    if (password === '') return showAlert('Master password missing.');
    const err = await login(username, password);
    if (err) return showAlert(err.error);
    goToPage('start');
  };

  return (
    <Stack spacing={3} alignItems='center' onKeyDown={e => e.key == 'Enter' && onClickLogin()}>
      <Stack spacing={1} direction='row' alignItems='center'>
        <Typography variant='h2'>Vaultoise</Typography>
        <AppIcon sx={{ width: '5rem', height: '5rem' }}/>
      </Stack>
      <Typography variant='h5'>Welcome back</Typography>
      <TextField label='Username' value={username} onChange={e => setUsername(e.target.value)} />
      <PasswordField label='Master Password' value={password} onChange={setPassword} />
      <Stack direction='row' spacing={1}>
        <Button variant='contained' onClick={onClickLogin}>Login</Button>
        <Button onClick={() => goToPage('signup')}>Sign Up</Button>
      </Stack>
    </Stack>
  );
}
