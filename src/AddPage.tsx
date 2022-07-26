import { useState } from 'react';
import { Alert, Button, Dialog, Grid, IconButton, Paper, Slider, Stack, Switch, TextField, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material';
import LoopIcon from '@mui/icons-material/Loop';
import { AppHeader, Page, useAsyncEffect } from './utils';
import { add_credentials, generate_password } from './backend';

function GenPasswordDialog({ open, setOpen, setPassword }: { open: boolean, setOpen: (b: boolean) => void, setPassword: (pw: string) => void}) {
  const [pw, setPw] = useState('');
  const [length, setLength] = useState(16);
  const [types, setTypes] = useState(['lowercase', 'uppercase', 'digits', 'special']);

  useAsyncEffect(async () => {
    let alphabet = '';
    if (types.includes('lowercase')) alphabet += 'abcdefghijklmnopqrstuvwxyz';
    if (types.includes('uppercase')) alphabet += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (types.includes('digits'))    alphabet += '0123456789';
    if (types.includes('special'))   alphabet += '!@#$%^&*';
    const res = await generate_password(alphabet, length);
    if (typeof res !== 'string')
      throw Error(res.error);
    setPw(res);
  }, [length, types]);

  const onClose = () => {
    setOpen(false);
    setPassword(pw);
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <Grid container spacing={2} width='25rem' margin='0 1rem 1rem 0rem' textAlign='center' alignItems='center'>
        <Grid item xs={12}>
          <Paper sx={{ padding:'1rem'}}>
            <Typography align='center' variant='h6' noWrap>{pw}</Typography>
          </Paper>
        </Grid>

        <Grid item xs={2}>
          <Typography>{length}</Typography>
        </Grid>
        <Grid item xs={10}>
          <Slider value={length} min={8} max={128} valueLabelDisplay='auto' onChange={(_, value) => setLength(value as number)} />
        </Grid>

        <Grid item xs={9}>
          <ToggleButtonGroup value={types} onChange={(_, value) => setTypes(value)}>
            <ToggleButton disableRipple value='lowercase' sx={{ textTransform: 'none' }}>
              <Typography>a-z</Typography>
            </ToggleButton>
            <ToggleButton disableRipple value='uppercase'>
              <Typography>A-Z</Typography>
            </ToggleButton>
            <ToggleButton disableRipple value='digits'>
              <Typography>0-9</Typography>
            </ToggleButton>
            <ToggleButton disableRipple value='special'>
              <Typography>!@#$%^&*</Typography>
            </ToggleButton>
          </ToggleButtonGroup>
        </Grid>

        <Grid item xs>
          <Button variant='contained' onClick={onClose}>Ok</Button>
        </Grid>
      </Grid>
    </Dialog>
  );
}

function AddPage({ goToPage }: { goToPage: (p: Page) => void}) {
  const [error, setError] = useState('');
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [openPasswordDialog, setOpenPasswordDialog] = useState(false);

  const onClickAddCredentials = async () => {
    if (name === '')
      return setError('Name missing.');
    if (username === '')
      return setError('Username missing.');
    if (password === '')
      return setError('Password missing.');
    const res = await add_credentials(name, username, password);
    if ('error' in res)
      return setError(res.error);
    goToPage('start');
  };

  return (
    <>
    <AppHeader goToPage={goToPage} backPage='start'/>
    <Stack spacing={3} sx={{ marginTop: '20px' }} alignItems='center' onKeyDown={e => e.key == 'Enter' && onClickAddCredentials()}>
      <h3>Add Credentials</h3>
      <TextField label='Name' value={name} onChange={e => setName(e.target.value)}/>
      <TextField label='Username' value={username} onChange={e => setUsername(e.target.value)}/>
      <div>
        <TextField label='Password' type='password' value={password} onChange={e => setPassword(e.target.value)}/>
        <IconButton sx={{position: 'absolute', transform: 'translateY(8px)'}} onClick={() => setOpenPasswordDialog(true)}>
          <LoopIcon/>
        </IconButton>
      </div>
      <Button variant='contained' onClick={onClickAddCredentials}>Add</Button>
      <GenPasswordDialog open={openPasswordDialog} setOpen={setOpenPasswordDialog} setPassword={setPassword} />
      {error && <Alert severity='error' onClose={() => setError('')}>{error}</Alert>}
    </Stack>
    </>
  );
}

export { AddPage };
