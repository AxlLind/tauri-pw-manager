import { useState } from 'react';
import { Stack, Button, TextField, Typography } from '@mui/material';
import { PageProps } from './utils';
import { create_account } from './backend';

function SignUpPage({ goToPage, setAlert }: PageProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [passwordCopy, setPasswordCopy] = useState('');

  const onClickLogin = async () => {
    if (username === '')
      return setAlert('Username missing.');
    if (password === '')
      return setAlert('Master password missing.');
    if (password !== passwordCopy)
      return setAlert('Passwords do not match');
    const err = await create_account(username, password);
    if (err)
      return setAlert(err.error);
    goToPage('start');
  };

  return (
    <Stack spacing={3} alignItems='center' onKeyDown={e => e.key == 'Enter' && onClickLogin()}>
      <Typography variant='h2' marginTop='3rem'>Tauri PW Manager</Typography>
      <Typography variant='h5'>Create an account</Typography>
      <TextField label='Username' value={username} onChange={e => setUsername(e.target.value)} />
      <TextField label='Master Password' type='password' value={password} onChange={e => setPassword(e.target.value)} />
      <TextField label='Retype Password' type='password' value={passwordCopy} onChange={e => setPasswordCopy(e.target.value)} />
      <Stack direction='row' spacing={1}>
        <Button variant='contained' onClick={onClickLogin}>Create</Button>
        <Button onClick={() => goToPage('login')}>Go Back</Button>
      </Stack>
    </Stack>
  );
}

export { SignUpPage };
