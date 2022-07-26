import { useState } from 'react';
import { Alert, Button, Stack, TextField } from '@mui/material';
import { useRecoilState } from 'recoil';
import { AppHeader } from './utils';
import { add_credentials } from './backend';
import { pageState } from './state';

function AddPage() {
  const [, goToPage] = useRecoilState(pageState);
  const [error, setError] = useState('');
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const onClickAddCredentials = async () => {
    if (name === '')
      return setError('Name missing.');
    if (username === '')
      return setError('Usename missing.');
    if (password === '')
      return setError('Password missing.');
    const res = await add_credentials(name, username, password);
    if ('error' in res)
      return setError(res.error);
    goToPage('start');
  };

  return (
    <>
    <AppHeader backPage='start'/>
    <Stack spacing={3} sx={{ marginTop: '20px' }} alignItems='center' onKeyDown={e => e.key == 'Enter' && onClickAddCredentials()}>
      <h3>Add Credentials</h3>
      <TextField label='Name' value={name} onChange={e => setName(e.target.value)}/>
      <TextField label='Username' value={username} onChange={e => setUsername(e.target.value)}/>
      <TextField label='Password' type='password' value={password} onChange={e => setPassword(e.target.value)}/>
      <Button variant='contained' onClick={onClickAddCredentials}>Add</Button>
      {error && <Alert severity='error' onClose={() => setError('')}>{error}</Alert>}
    </Stack>
    </>
  );
}

export { AddPage };
