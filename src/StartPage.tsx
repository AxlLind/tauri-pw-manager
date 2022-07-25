import { Alert, Button, Stack, TextField, Dialog } from '@mui/material';
import { useState } from 'react';
import { useAsyncEffect } from './utils';
import { fetch_credentials, add_credentials, CredentialsDatabase } from './backend';

function StartPage() {
  const [credentials, setCredentials] = useState({ username: '', credentials: {}} as CredentialsDatabase);
  const [error, setError] = useState('');
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);

  useAsyncEffect(async () => {
    const res = await fetch_credentials();
    if ('error' in res)
      return setError(res.error);
    setCredentials(res)
  }, []);

  const closeDialog = () => {
    setName('');
    setUsername('');
    setPassword('');
    setDialogOpen(false);
  };

  const onClickAddCredentials = async () => {
    closeDialog();
    if (name === '')
      return setError('Name missing.');
    if (username === '')
      return setError('Usename missing.');
    if (password === '')
      return setError('Password missing.');
    const res = await add_credentials(name, username, password);
    if ('error' in res)
      return setError(res.error);
    setCredentials(res);
  };

  return (
    <Stack spacing={3} alignItems='center'>
      <h1>Tauri PW Manager</h1>
      <h3>Credentials</h3>
      {
        Object.entries(credentials.credentials).map(([name, {username, password}]) =>
          <Stack spacing={1} direction='row'>
            <div>{name}</div>
            <div>{username}</div>
            <div>{password}</div>
          </Stack>
        )
      }
      <Button variant='contained' onClick={() => setDialogOpen(true)}>Add Credentials</Button>
      <Dialog open={dialogOpen} onClose={closeDialog}>
        <Stack spacing={2} alignItems='center' margin={3} onKeyDown={e => e.key == 'Enter' && onClickAddCredentials()}>
          <h3>Add credential</h3>
          <TextField label='Name' value={name} onChange={e => setName(e.target.value)}/>
          <TextField label='Username' value={username} onChange={e => setUsername(e.target.value)}/>
          <TextField label='Password' type='password' value={password} onChange={e => setPassword(e.target.value)}/>
          <Button variant='contained' onClick={onClickAddCredentials}>Add</Button>
        </Stack>
      </Dialog>
      {error && <Alert severity='error' onClose={() => setError('')}>{error}</Alert>}
    </Stack>
  );
}

export { StartPage };
