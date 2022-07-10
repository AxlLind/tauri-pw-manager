import { useState } from 'react';
import { useRecoilState } from 'recoil';
import { Grid, Button, TextField } from '@mui/material';
import { pageState } from './state';

function LoginPage() {
  const [_, goToPage] = useRecoilState(pageState);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const onClickLogin = () => {
    if (email === '' || password === '')
      return
    goToPage('start');
  };

  return (
    <Grid container alignItems='center' direction='column'>
      <h1>Tauri PW Manager</h1>
      <h3>Welcome back</h3>
      <TextField label='Email' type='email' value={email} onChange={e => setEmail(e.target.value)} autoFocus />
      <br/>
      <TextField label='Master Password' type='password' value={password} onChange={e => setPassword(e.target.value)} />
      <br/>
      <Grid>
        <Button variant='contained' onClick={onClickLogin}>Login</Button>
        <Button onClick={() => goToPage('signup')}>Sign Up</Button>
      </Grid>
    </Grid>
  );
}

export { LoginPage };
