import { Alert, Button, Stack, TextField } from '@mui/material';
import { useEffect, useState } from 'react';
import { backend, CredentialsDatabase } from './backend';

function StartPage() {
  const [credentials, setCredentials] = useState({ username: '', credentials: {}} as CredentialsDatabase);
  const [error, setError] = useState('');
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    (async () => {
      const res = await backend.fetch_credentials();
      if ('error' in res)
        return setError(res.error);
      setCredentials(res)
    })();
  }, []);

  const onClickAddCredential = async () => {
    const res = await backend.add_credentials(name, username, password);
    if (res?.error)
      return setError(res.error);
    credentials.credentials[name] = {username, password};
    setCredentials({...credentials});
  };

  return (
    <Stack spacing={3} alignItems='center'>
      <h1>Tauri PW Manager</h1>
      <h3>Add credential</h3>
      <TextField label='Name' value={name} onChange={e => setName(e.target.value)}/>
      <TextField label='Username' value={username} onChange={e => setUsername(e.target.value)}/>
      <TextField label='Password' value={password} onChange={e => setPassword(e.target.value)}/>
      <Button variant='contained' onClick={onClickAddCredential}>Add</Button>
      <h3>Credentials</h3>
      {
        credentials && Object.entries(credentials.credentials).map(([name, {username, password}]) =>
          <Stack spacing={1} direction='row'>
            <div>{name}</div>
            <div>{username}</div>
            <div>{password}</div>
          </Stack>
        )
      }
      {error && <Alert severity='error' onClose={() => setError('')}>{error}</Alert>}
    </Stack>
  );
}

export { StartPage };
