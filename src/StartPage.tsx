import { useState } from 'react';
import { Alert, Stack, Fab } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useRecoilState } from 'recoil';
import { useAsyncEffect, AppHeader } from './utils';
import { fetch_credentials, CredentialsDatabase } from './backend';
import { pageState } from './state';

function StartPage() {
  const [, goToPage] = useRecoilState(pageState);
  const [credentials, setCredentials] = useState({ username: '', credentials: {}} as CredentialsDatabase);
  const [error, setError] = useState('');

  useAsyncEffect(async () => {
    const res = await fetch_credentials();
    if ('error' in res)
      return setError(res.error);
    setCredentials(res)
  }, []);

  return (
    <>
    <AppHeader backPage='login'/>
    <Stack spacing={3} alignItems='center'>
      <h3>Credentials</h3>
      {
        Object.entries(credentials.credentials).map(([name, { username, password }]) =>
          <Stack key={name} spacing={1} direction='row'>
            <div>{name}</div>
            <div>{username}</div>
            <div>{password}</div>
          </Stack>
        )
      }
      <Fab color='primary' sx={{ position: 'absolute', bottom: 20, right: 20 }} onClick={() => goToPage('add')}>
        <AddIcon/>
      </Fab>
      {error && <Alert severity='error' onClose={() => setError('')}>{error}</Alert>}
    </Stack>
    </>
  );
}

export { StartPage };
