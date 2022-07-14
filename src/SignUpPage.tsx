import { useState } from 'react';
import { useRecoilState } from 'recoil';
import { Grid, Button, TextField, Alert } from '@mui/material';
import { pageState } from './state';
import { create_account } from './backend';

function SignUpPage() {
  const [, goToPage] = useRecoilState(pageState);
  const [error, setError] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const onClickLogin = async () => {
    if (username === '')
      return setError('Username missing.');
    if (password === '')
      return setError('Master password missing.');
    const error = await create_account(username, password);
    if (error)
      return setError(error.message);
    goToPage('start');
  };

  return (
    <Grid container alignItems='center' direction='column'>
      <h1>Tauri PW Manager</h1>
      <h3>Create an account</h3>
      <TextField label='Username' value={username} onChange={e => setUsername(e.target.value)} />
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
