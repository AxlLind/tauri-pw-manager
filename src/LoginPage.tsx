import { useRecoilState } from 'recoil';
import Grid from '@mui/material/Grid';
import { pageState } from './state';
import { Button, TextField } from '@mui/material';
import { useState } from 'react';

function LoginPage() {
  const [_, goToPage] = useRecoilState(pageState);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const onClickLogin = () => {
    if (email === '') {
      return;
    }
    if (password === '') {
      return
    }
    goToPage('start');
  };

  return (
    <Grid container alignItems='center' direction='column'>
      <h1>Tauri PW Manager</h1>
      <h3>Welcome back</h3>
      <TextField label='Email' type='email' value={email} onChange={e => setEmail(e.target.value)} autoFocus />
      <br/>
      <TextField label='Password' type='password' value={password} onChange={e => setPassword(e.target.value)} />
      <br/>
      <Button onClick={onClickLogin}>Login</Button>
    </Grid>
  );
}

export { LoginPage };
