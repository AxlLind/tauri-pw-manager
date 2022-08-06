import React, { useState } from 'react';
import { Stack, Fab, Typography, IconButton, Paper, Tooltip, Dialog, DialogContent, DialogActions, Button } from '@mui/material';
import { Add, Person, Key, Delete } from '@mui/icons-material';
import { useAsyncEffect, PageProps } from './utils';
import { fetch_credentials, remove_credentials, copy_to_clipboard } from './backend';

export function StartPage({ goToPage, showAlert }: PageProps) {
  const [credentials, setCredentials] = useState([] as string[]);
  const [credentialsToRemove, setCredentialsToRemove] = useState('');

  const populateCredentials = async () => {
    const res = await fetch_credentials();
    if ('error' in res) return showAlert(res.error);
    setCredentials(res)
  };

  useAsyncEffect(populateCredentials, []);

  const copyValue = async (e: React.MouseEvent, name: string, thing: 'username' | 'password') => {
    e.stopPropagation();
    const res = await copy_to_clipboard(name, thing);
    console.log(res);
    if (res?.error) return showAlert(res.error);
    showAlert(`${thing} copied to clipboard`, 'success');
  };

  const onRemoveCredentials = async () => {
    setCredentialsToRemove('');
    const res = await remove_credentials(credentialsToRemove);
    if (res?.error) return showAlert(res.error);
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
              <IconButton children={<Person/>} onClick={e => copyValue(e, name, 'username')}/>
            </Tooltip>
            <Tooltip title='copy password'>
              <IconButton children={<Key/>} onClick={e => copyValue(e, name, 'password')}/>
            </Tooltip>
            <Tooltip title='delete credentials'>
              <IconButton children={<Delete/>} onClick={e => { e.stopPropagation(); setCredentialsToRemove(name); }}/>
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
  </>;
}
