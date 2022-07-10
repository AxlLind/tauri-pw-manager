import { useState } from 'react';
import { useRecoilState } from 'recoil';
import { Grid, Button, TextField } from '@mui/material';
import { pageState } from './state';

function SignUpPage() {
  const [_, goToPage] = useRecoilState(pageState);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const onClickCreate = () => {
    if (email === '' || password === '')
      return
    goToPage('start');
  };

  return (
    <Grid container alignItems='center' direction='column'>
      <h1>Tauri PW Manager</h1>
      <h3>Create an account</h3>
      <TextField label='Email' type='email' value={email} onChange={e => setEmail(e.target.value)} autoFocus />
      <br/>
      <TextField label='Master Password' type='password' value={password} onChange={e => setPassword(e.target.value)} />
      <br/>
      <Grid>
        <Button variant='contained' onClick={onClickCreate}>Create</Button>
        <Button onClick={() => goToPage('login')}>Go Back</Button>
      </Grid>
    </Grid>
  );
}

export { SignUpPage };
