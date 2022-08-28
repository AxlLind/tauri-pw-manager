import { useContext, useState } from 'react';
import { Stack, Button, TextField, Typography } from '@mui/material';
import { PageContext, PageProps, PasswordField } from './utils';
import { create_account } from './backend';

export function SignUpPage() {
  const { goToPage, showAlert } = useContext(PageContext);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [passwordCopy, setPasswordCopy] = useState('');

  const onClickLogin = async () => {
    if (username === '') return showAlert('Username missing.');
    if (password === '') return showAlert('Master password missing.');
    if (password !== passwordCopy) return showAlert('Passwords do not match');
    const res = await create_account(username, password);
    if (!res.ok) return showAlert(res.error);
    goToPage('start');
  };

  return (
    <Stack height='100vh' alignItems='center'>
      <Typography variant='h5' marginTop='2rem'>Create an account</Typography>
      <Stack margin='auto' spacing={3} alignItems='center' onKeyDown={e => e.key == 'Enter' && onClickLogin()}>
        <TextField label='Username' value={username} onChange={e => setUsername(e.target.value)} />
        <PasswordField label='Master Password' value={password} onChange={setPassword} />
        <PasswordField label='Retype Password' value={passwordCopy} onChange={setPasswordCopy} />
        <Button variant='contained' onClick={onClickLogin}>Create</Button>
      </Stack>
    </Stack>
  );
}
