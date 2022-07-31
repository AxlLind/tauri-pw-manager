import { useState } from 'react';
import { Button, Dialog, Grid, IconButton, Paper, Slider, Stack, TextField, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material';
import { Loop } from '@mui/icons-material';
import { AppHeader, PageProps, PasswordField, useAsyncEffect } from './utils';
import { add_credentials, generate_password } from './backend';

function GenPasswordDialog({ open, setOpen, setPassword }: { open: boolean, setOpen: (b: boolean) => void, setPassword: (pw: string) => void}) {
  const [pw, setPw] = useState('');
  const [length, setLength] = useState(16);
  const [types, setTypes] = useState(['lowercase', 'uppercase', 'digits', 'special']);

  useAsyncEffect(async () => {
    if (!open)
      return;
    const res = await generate_password(length, types);
    if (typeof res !== 'string')
      throw Error(res.error);
    setPw(res);
  }, [open, length, types]);

  const onClose = () => {
    setOpen(false);
    setPassword(pw);
  };

  return (
    <Dialog open={open} onClose={onClose} onKeyDown={e => e.key == 'Enter' && onClose()}>
      <Grid container spacing={2} width='25rem' margin='0 1rem 1rem 0rem' textAlign='center' alignItems='center'>
        <Grid item xs={12}>
          <Typography>Generate Password</Typography>
        </Grid>
        <Grid item xs={12}>
          <Paper sx={{ padding:'1rem'}}>
            <Typography align='center' variant='h6' noWrap>{pw}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={2}>
          <Typography>{length}</Typography>
        </Grid>
        <Grid item xs={10}>
          <Slider value={length} min={10} max={128} valueLabelDisplay='auto' onChange={(_, value) => setLength(value as number)} />
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
        <Grid item xs={3}>
          <Button variant='contained' onClick={onClose}>Ok</Button>
        </Grid>
      </Grid>
    </Dialog>
  );
}

function AddPage({ goToPage, showAlert }: PageProps) {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [openDialog, setOpenDialog] = useState(false);

  const onClickAddCredentials = async () => {
    if (name === '') return showAlert('Name missing.');
    if (username === '') return showAlert('Username missing.');
    if (password === '') return showAlert('Password missing.');
    const res = await add_credentials(name, username, password);
    if ('error' in res) return showAlert(res.error);
    goToPage('start');
  };

  return <>
    <AppHeader goToPage={goToPage} backPage='start'/>
    <Stack spacing={3} alignItems='center' onKeyDown={e => !openDialog && e.key == 'Enter' && onClickAddCredentials()}>
      <Typography variant='h5' marginTop='2rem'>Add Credentials</Typography>
      <TextField label='Name' value={name} onChange={e => setName(e.target.value)}/>
      <TextField label='Username' value={username} onChange={e => setUsername(e.target.value)}/>
      <div>
        <PasswordField label='Password' value={password} onChange={setPassword}/>
        <IconButton children={<Loop/>} sx={{position: 'absolute', transform: 'translateY(8px)'}} onClick={() => setOpenDialog(true)}/>
      </div>
      <Button variant='contained' onClick={onClickAddCredentials}>Add</Button>
      <GenPasswordDialog open={openDialog} setOpen={setOpenDialog} setPassword={setPassword} />
    </Stack>
  </>;
}

export { AddPage };
