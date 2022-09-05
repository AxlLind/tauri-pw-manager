import { useContext, useState } from 'react';
import { Stack, Button, TextField, Typography, Box } from '@mui/material';
import { useAsyncEffect, PasswordField, AppIcon, PageContext } from './utils';
import { login, logout } from './backend';

export function LoginPage() {
  const { goToPage, showAlert } = useContext(PageContext);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  useAsyncEffect(logout, []);

  const onClickLogin = async () => {
    if (username === '') return showAlert('Username missing.');
    if (password === '') return showAlert('Master password missing.');
    const res = await login(username, password);
    if (!res.ok) return showAlert(res.error);
    goToPage('start');
  };

  return (
    <Box height='100vh' display='flex' bgcolor='#282a36' borderRadius='10px' border='2px solid #404353'>
      <Stack margin='auto' spacing={3} alignItems='center' onKeyDown={e => e.key == 'Enter' && onClickLogin()}>
        <Stack direction='row' alignItems='center'>
          <Typography variant='h2'>Scop</Typography>
          <AppIcon sx={{ width: '5rem', height: '5rem', paddingTop: '10px' }}/>
        </Stack>
        <Typography variant='h5'>Welcome back</Typography>
        <TextField label='Username' value={username} onChange={e => setUsername(e.target.value)} />
        <PasswordField label='Master Password' value={password} onChange={setPassword} />
        <Stack direction='row' spacing={1}>
          <Button variant='contained' onClick={onClickLogin}>Login</Button>
          <Button onClick={() => goToPage('signup')}>Sign Up</Button>
        </Stack>
      </Stack>
    </Box>
  );
}
