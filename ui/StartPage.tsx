import React, { useState } from 'react';
import { Stack, Fab, Accordion, AccordionSummary, Typography, AccordionDetails, IconButton, Paper, Tooltip, Dialog, DialogContent, DialogActions, Button } from '@mui/material';
import { Add, ExpandMore, Person, Key, Delete } from '@mui/icons-material';
import { useAsyncEffect, PageProps } from './utils';
import { CredentialsDatabase, fetch_credentials, remove_credentials, copy_to_clipboard } from './backend';

export function StartPage({ goToPage, showAlert }: PageProps) {
  const [credentials, setCredentials] = useState({ username: '', credentials: {} } as CredentialsDatabase);
  const [expanded, setExpanded] = useState('');
  const [credentialsToRemove, setCredentialsToRemove] = useState('');

  useAsyncEffect(async () => {
    const res = await fetch_credentials();
    if ('error' in res) return showAlert(res.error);
    setCredentials(res)
  }, []);

  const copyValue = async (e: React.MouseEvent, name: string, thing: 'username' | 'password') => {
    e.stopPropagation();
    const res = await copy_to_clipboard(credentials.credentials[name][thing]);
    if (res?.error) return showAlert(res.error);
    showAlert(`${thing} copied to clipboard`, 'success');
  };

  const onRemoveCredentials = async (remove: boolean) => {
    if (remove) {
      const res = await remove_credentials(credentialsToRemove);
      if ('error' in res) return showAlert(res.error);
      setCredentials(res);
    }
    setCredentialsToRemove('');
  }

  return <>
    <Stack spacing={1} alignItems='center' justifyContent='center'>
      <Typography variant='h5'>Credentials</Typography>
      {
        Object.entries(credentials.credentials)
          .sort(([n1,], [n2,]) => n1 < n2 ? -1 : 1)
          .map(([name, { username, password }]) =>
            <Accordion key={name} expanded={expanded === name} onChange={() => setExpanded(expanded === name ? '' : name)} disableGutters sx={{ width: '30rem' }} >
              <AccordionSummary expandIcon={<ExpandMore/>}>
                <Typography alignSelf='center' flexGrow={1}>{name}</Typography>
                <Tooltip title='copy username'>
                  <IconButton children={<Person/>} onClick={e => copyValue(e, name, 'username')}/>
                </Tooltip>
                <Tooltip title='copy password'>
                  <IconButton children={<Key/>} onClick={e => copyValue(e, name, 'password')}/>
                </Tooltip>
                <Tooltip title='delete credentials'>
                  <IconButton children={<Delete/>} onClick={e => {e.stopPropagation(); setCredentialsToRemove(name);}}/>
                </Tooltip>
              </AccordionSummary>
              <AccordionDetails>
                <Paper variant='outlined' sx={{ padding: '0.5rem' }}>
                  <Typography variant='overline'>Username</Typography>
                  <Typography noWrap>{username}</Typography>
                  <Typography variant='overline'>Password</Typography>
                  <Typography noWrap>{password}</Typography>
                </Paper>
              </AccordionDetails>
            </Accordion>
          )
      }
    </Stack>
    <Tooltip title='Add credentials' placement='left'>
      <Fab children={<Add/>} color='primary' sx={{ position: 'fixed', bottom: 20, right: 20 }} onClick={() => goToPage('add')}/>
    </Tooltip>
    <Dialog open={!!credentialsToRemove} onClose={() => onRemoveCredentials(false)}>
      <DialogContent>Delete credentials?</DialogContent>
      <DialogActions style={{ justifyContent: 'space-between', margin: "0 2rem 10px 2rem" }}>
        <Button variant='contained' onClick={() => onRemoveCredentials(true)}>Delete</Button>
        <Button onClick={() => onRemoveCredentials(false)}>Cancel</Button>
      </DialogActions>
    </Dialog>
  </>;
}
