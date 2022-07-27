import React, { useState } from 'react';
import { Stack, Fab, Accordion, AccordionSummary, Typography, AccordionDetails, IconButton, Paper, Tooltip } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import PersonIcon from '@mui/icons-material/Person';
import KeyIcon from '@mui/icons-material/Key';
import DeleteIcon from '@mui/icons-material/Delete';
import { useAsyncEffect, AppHeader, PageProps } from './utils';
import { CredentialsDatabase, fetch_credentials, remove_credentials, copy_to_clipboard } from './backend';

function StartPage({ goToPage, setAlert }: PageProps) {
  const [credentials, setCredentials] = useState({ username: '', credentials: {}} as CredentialsDatabase);
  const [expanded, setExpanded] = useState('');

  useAsyncEffect(async () => {
    const res = await fetch_credentials();
    if ('error' in res)
      return setAlert(res.error);
    setCredentials(res)
  }, []);

  const copyValue = async (e: React.MouseEvent, name: string, thing: 'username' | 'password') => {
    e.stopPropagation();
    setAlert((await copy_to_clipboard(credentials.credentials[name][thing]))?.error || '');
  };

  const onRemoveCredentials = async (name: string) => {
    const res = await remove_credentials(name);
    if ('error' in res)
      return setAlert(res.error);
    setCredentials(res);
  }

  return <>
    <AppHeader goToPage={goToPage} backPage='login'/>
    <Stack spacing={1} alignItems='center'>
      <Typography variant='h5' marginY='2rem'>Credentials</Typography>
      {
        Object.entries(credentials.credentials).map(([name, { username, password }]) =>
          <Accordion key={name} expanded={expanded === name} onChange={() => setExpanded(expanded === name ? '' : name)} disableGutters sx={{ width: '30rem' }} >
            <AccordionSummary expandIcon={<ExpandMoreIcon/>}>
              <Typography alignSelf='center' flexGrow={1}>{name}</Typography>
              <Tooltip title='copy username'>
                <IconButton onClick={e => copyValue(e, name, 'username')}><PersonIcon/></IconButton>
              </Tooltip>
              <Tooltip title='copy password'>
                <IconButton onClick={e => copyValue(e, name, 'password')}><KeyIcon/></IconButton>
              </Tooltip>
            </AccordionSummary>
            <AccordionDetails>
              <Paper variant='outlined' sx={{ padding: '0.5rem' }}>
                <Typography variant='overline'>Username</Typography>
                <Typography>{username}</Typography>
                <Typography variant='overline'>Password</Typography>
                <Typography>{password}</Typography>
                <Tooltip title='delete credentials'>
                  <IconButton onClick={() => onRemoveCredentials(name)}><DeleteIcon/></IconButton>
                </Tooltip>
              </Paper>
            </AccordionDetails>
          </Accordion>
        )
      }
      <Fab color='primary' sx={{ position: 'fixed', bottom: 20, right: 20 }} onClick={() => goToPage('add')}>
        <AddIcon/>
      </Fab>
    </Stack>
  </>;
}

export { StartPage };
