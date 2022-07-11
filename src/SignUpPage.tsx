import { useState } from 'react';
import { useRecoilState } from 'recoil';
import { Grid, Button, TextField, Alert } from '@mui/material';
import { pageState, tokenState } from './state';
import { create_account } from './backend';

function SignUpPage() {
  const [, goToPage] = useRecoilState(pageState);
  const [, setSessionToken] = useRecoilState(tokenState);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const onClickLogin = async () => {
    if (email === '')
      return setError('Email missing.');
    if (password === '')
      return setError('Master password missing.');
    const res = await create_account(email, password);
    if ('err' in res)
      return setError(res.err);
    setSessionToken(res.token);
    goToPage('start');
  };

  return (
    <Grid container alignItems='center' direction='column'>
      <h1>Tauri PW Manager</h1>
      <h3>Create an account</h3>
      <TextField label='Email' type='email' value={email} onChange={e => setEmail(e.target.value)} />
      <br/>
      <TextField label='Master Password' type='password' value={password} onChange={e => setPassword(e.target.value)} />
      <br/>
      <Grid>
        <Button variant='contained' onClick={onClickLogin}>Create</Button>
        <Button onClick={() => goToPage('login')}>Go Back</Button>
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

export { SignUpPage };
