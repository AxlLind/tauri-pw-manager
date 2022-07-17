import { useState } from 'react';
import { useRecoilState } from 'recoil';
import { Stack, Button, TextField, Alert } from '@mui/material';
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
    <Stack spacing={3} alignItems='center' onKeyDown={e => e.key == 'Enter' && onClickLogin()}>
      <h1>Tauri PW Manager</h1>
      <h3>Create an account</h3>
      <TextField label='Username' value={username} onChange={e => setUsername(e.target.value)} />
      <TextField label='Master Password' type='password' value={password} onChange={e => setPassword(e.target.value)} />
      <Stack direction='row' spacing={1}>
        <Button variant='contained' onClick={onClickLogin}>Create</Button>
        <Button onClick={() => goToPage('login')}>Go Back</Button>
      </Stack>
      {error && <Alert severity='error' onClose={() => setError('')}>{error}</Alert>}
    </Stack>
  );
}

export { SignUpPage };
