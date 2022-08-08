import { useState } from 'react';
import { Stack, Fab, Typography, IconButton, Paper, Tooltip, Dialog, DialogContent, DialogActions, Button, DialogTitle, AlertColor, Divider } from '@mui/material';
import { Add, Person, Key, Delete, MoreHoriz } from '@mui/icons-material';
import { useAsyncEffect, PageProps } from './utils';
import { fetch_credentials, remove_credentials, copy_to_clipboard, get_credentials_info, Credentials } from './backend';

function CredentialsDialog({ name, onClose, showAlert }: { name: string, onClose: () => void, showAlert: (m: string, severity?: AlertColor) => void }) {
  const [{ username, password }, setCredentials] = useState<Credentials>({ username: '', password: '' });

  useAsyncEffect(async () => {
    if (!name) return;
    const res = await get_credentials_info(name);
    if (!res.ok) return showAlert(res.error);
    setCredentials(res.value);
  }, [name]);

  return (
    <Dialog open={!!name} onClose={onClose}>
      <DialogTitle textAlign='center'>Credentials Details</DialogTitle>
      <DialogContent>
        <Paper sx={{ width: '25rem', padding: '1rem' }}>
          <Typography variant='overline'>Name</Typography>
          <Typography>{name}</Typography>
          <Divider/>
          <Typography variant='overline'>Username</Typography>
          <Typography noWrap>{username}</Typography>
          <Divider/>
          <Typography variant='overline'>Password</Typography>
          <Typography noWrap>{password}</Typography>
          <Divider/>
        </Paper>
      </DialogContent>
      <DialogActions sx={{ padding: '0 2rem 1rem 0'}}>
        <Button variant='contained' onClick={onClose}>Ok</Button>
      </DialogActions>
    </Dialog>
  );
}

export function StartPage({ goToPage, showAlert }: PageProps) {
  const [credentials, setCredentials] = useState([] as string[]);
  const [credentialsToRemove, setCredentialsToRemove] = useState('');
  const [credentialsToShow, setCredentialsToShow] = useState('');

  const populateCredentials = async () => {
    const res = await fetch_credentials();
    if (!res.ok) return showAlert(res.error);
    setCredentials(res.value)
  };

  useAsyncEffect(populateCredentials, []);

  const copyValue = async (name: string, thing: 'username' | 'password') => {
    const res = await copy_to_clipboard(name, thing);
    if (!res.ok) return showAlert(res.error);
    showAlert(`${thing} copied to clipboard`, 'success');
  };

  const onRemoveCredentials = async () => {
    setCredentialsToRemove('');
    const res = await remove_credentials(credentialsToRemove);
    if (!res.ok) return showAlert(res.error);
    await populateCredentials();
  }

  return <>
    <Stack spacing={1} alignItems='center'>
      <Typography variant='h5' marginTop='2rem'>Credentials</Typography>
      {
        credentials.sort().map(name =>
          <Paper sx={{ width: '30rem', display: 'flex', padding: '0.5rem 1rem' }} elevation={4}>
            <Typography alignSelf='center' flexGrow={1}>{name}</Typography>
            <Tooltip title='copy username'>
              <IconButton children={<Person/>} onClick={() => copyValue(name, 'username')}/>
            </Tooltip>
            <Tooltip title='copy password'>
              <IconButton children={<Key/>} onClick={() => copyValue(name, 'password')}/>
            </Tooltip>
            <Tooltip title='delete credentials'>
              <IconButton children={<Delete/>} onClick={() => setCredentialsToRemove(name)}/>
            </Tooltip>
            <Tooltip title='view credentials'>
              <IconButton children={<MoreHoriz/>} onClick={() => setCredentialsToShow(name)}/>
            </Tooltip>
          </Paper>
        )
      }
    </Stack>
    <Tooltip title='Add credentials' placement='left'>
      <Fab children={<Add/>} color='primary' sx={{ position: 'fixed', bottom: 20, right: 20 }} onClick={() => goToPage('add')}/>
    </Tooltip>
    <Dialog open={!!credentialsToRemove} onClose={() => setCredentialsToRemove('')}>
      <DialogContent>Delete credentials?</DialogContent>
      <DialogActions style={{ justifyContent: 'space-between', margin: "0 2rem 10px 2rem" }}>
        <Button variant='contained' onClick={onRemoveCredentials}>Delete</Button>
        <Button onClick={() => setCredentialsToRemove('')}>Cancel</Button>
      </DialogActions>
    </Dialog>
    <CredentialsDialog name={credentialsToShow} onClose={() => setCredentialsToShow('')} showAlert={showAlert}/>
  </>;
}
