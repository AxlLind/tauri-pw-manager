import React, { useState } from 'react';
import { Alert, Stack, Fab, Accordion, AccordionSummary, Typography, AccordionDetails, IconButton, Paper, Tooltip } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import PersonIcon from '@mui/icons-material/Person';
import KeyIcon from '@mui/icons-material/Key';
import { useAsyncEffect, AppHeader, Page } from './utils';
import { fetch_credentials, CredentialsDatabase } from './backend';

function StartPage({ goToPage }: { goToPage: (p: Page) => void}) {
  const [credentials, setCredentials] = useState({ username: '', credentials: {}} as CredentialsDatabase);
  const [error, setError] = useState('');
  const [expanded, setExpanded] = useState('');

  useAsyncEffect(async () => {
    const res = await fetch_credentials();
    if ('error' in res)
      return setError(res.error);
    setCredentials(res)
  }, []);

  return (
    <>
    <AppHeader goToPage={goToPage} backPage='login'/>
    <Stack spacing={1} alignItems='center'>
      <Typography variant='h5' marginY='2rem'>Credentials</Typography>
      {
        Object.entries(credentials.credentials).map(([name, { username, password }]) =>
          <Accordion key={name} expanded={expanded === name} onChange={() => setExpanded(expanded === name ? '' : name)} disableGutters sx={{ width: '30rem' }} >
            <AccordionSummary expandIcon={<ExpandMoreIcon/>}>
              <Typography alignSelf='center' flexGrow={1}>{name}</Typography>
              <Tooltip title='copy username'>
                <IconButton><PersonIcon/></IconButton>
              </Tooltip>
              <Tooltip title='copy password'>
                <IconButton><KeyIcon/></IconButton>
              </Tooltip>
            </AccordionSummary>
            <AccordionDetails>
              <Paper variant='outlined' sx={{ padding: '0.5rem' }}>
                <Typography variant='overline'>Username</Typography>
                <Typography>{username}</Typography>
                <Typography variant='overline'>Password</Typography>
                <Typography>{password}</Typography>
              </Paper>
            </AccordionDetails>
          </Accordion>
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
