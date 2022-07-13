import { useState } from 'react';
import { useRecoilState } from 'recoil';
import { Grid, Button, TextField, Alert } from '@mui/material';
import { pageState } from './state';
import { login } from './backend';

function LoginPage() {
  const [, goToPage] = useRecoilState(pageState);
  const [error, setError] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const onClickLogin = async () => {
    if (username === '')
      return setError('Username missing.');
    if (password === '')
      return setError('Master password missing.');
    const error = await login(username, password);
    if (error)
      return setError(error);
    goToPage('start');
  };

  return (
    <Grid container alignItems='center' direction='column'>
      <h1>Tauri PW Manager</h1>
      <h3>Welcome back</h3>
      <TextField label='Username' value={username} onChange={e => setUsername(e.target.value)} />
      <br/>
      <TextField label='Master Password' type='password' value={password} onChange={e => setPassword(e.target.value)} />
      <br/>
      <Grid>
        <Button variant='contained' onClick={onClickLogin}>Login</Button>
        <Button onClick={() => goToPage('signup')}>Sign Up</Button>
      </Grid>
      {error &&
        <>
        <br/>
        <Alert severity='error' onClose={() => setError('')}>{error}</Alert>
        </>
      }
    </Grid>
  );
}

export { LoginPage };
