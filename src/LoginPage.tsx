import { useState } from 'react';
import { Stack, Button, TextField, Alert } from '@mui/material';
import { useAsyncEffect, Page } from './utils';
import { login, logout } from './backend';

function LoginPage({ goToPage }: { goToPage: (p: Page) => void}) {
  const [error, setError] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  useAsyncEffect(logout, []);

  const onClickLogin = async () => {
    if (username === '')
      return setError('Username missing.');
    if (password === '')
      return setError('Master password missing.');
    const err = await login(username, password);
    if (err)
      return setError(err.error);
    goToPage('start');
  };

  return (
    <Stack spacing={3} alignItems='center' onKeyDown={e => e.key == 'Enter' && onClickLogin()}>
      <h1>Tauri PW Manager</h1>
      <h3>Welcome back</h3>
      <TextField label='Username' value={username} onChange={e => setUsername(e.target.value)} />
      <TextField label='Master Password' type='password' value={password} onChange={e => setPassword(e.target.value)} />
      <Stack direction='row' spacing={1}>
        <Button variant='contained' onClick={onClickLogin}>Login</Button>
        <Button onClick={() => goToPage('signup')}>Sign Up</Button>
      </Stack>
      {error && <Alert severity='error' onClose={() => setError('')}>{error}</Alert>}
    </Stack>
  );
}

export { LoginPage };
