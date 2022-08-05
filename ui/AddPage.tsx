import { useState } from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Paper, Slider, Stack, TextField, ToggleButton, ToggleButtonGroup, Tooltip, Typography } from '@mui/material';
import { Loop } from '@mui/icons-material';
import { PageProps, PasswordField, useAsyncEffect } from './utils';
import { add_credentials, generate_password } from './backend';

export function AddPage({ goToPage, showAlert }: PageProps) {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [openTooltip, setOpenToolip] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
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

  const onClickAddCredentials = async () => {
    if (name === '') return showAlert('Name missing.');
    if (username === '') return showAlert('Username missing.');
    if (password === '') return showAlert('Password missing.');
    const res = await add_credentials(name, username, password);
    if ('error' in res) return showAlert(res.error);
    goToPage('start');
  };

  const onDialogClose = () => {
    setOpenDialog(false);
    setPassword(pw);
  };

  return <>
    <Stack spacing={3} alignItems='center' justifyContent='center' onKeyDown={e => !openDialog && e.key == 'Enter' && onClickAddCredentials()}>
      <Typography variant='h5'>Add Credentials</Typography>
      <TextField label='Name' value={name} onChange={e => setName(e.target.value)}/>
      <TextField label='Username' value={username} onChange={e => setUsername(e.target.value)}/>
      <div>
        <PasswordField label='Password' value={password} onChange={setPassword}/>
        <Tooltip title='Generate password' disableHoverListener onMouseEnter={() => setOpenToolip(true)} onMouseLeave={() => setOpenToolip(false)} open={!openDialog && openTooltip}>
          <IconButton children={<Loop/>} sx={{position: 'absolute', transform: 'translateY(8px)'}} onClick={() => setOpenDialog(true)}/>
        </Tooltip>
      </div>
      <Button variant='contained' onClick={onClickAddCredentials}>Add</Button>
    </Stack>
    <Dialog open={openDialog} onClose={onDialogClose} onKeyDown={e => e.key == 'Enter' && onDialogClose()}>
      <DialogTitle textAlign='center'>Generate Password</DialogTitle>
      <DialogContent sx={{ margin: '0 1rem 0 1rem' }}>
        <Paper sx={{ width: '25rem', padding:'1rem', marginBottom: '1rem' }}>
          <Typography align='center' variant='h6' noWrap>{pw}</Typography>
        </Paper>
        <Slider sx={{ width: '24rem', marginLeft: '0.5rem'}} value={length} min={10} max={128} marks={[{ value: length, label: length }]} onChange={(_, value) => setLength(value as number)}/>
      </DialogContent>
      <DialogActions style={{ justifyContent: 'space-between', margin: "0 3rem 1rem 3rem" }}>
        <ToggleButtonGroup value={types} onChange={(_, value) => value.length && setTypes(value)}>
          {[['lowercase', 'a-z'], ['uppercase', 'A-Z'], ['digits', '0-9'], ['special', '!@#$%^&*']].map(([value, text]) =>
            <ToggleButton disableRipple value={value} sx={{ textTransform: 'none' }}>
              <Typography>{text}</Typography>
            </ToggleButton>
          )}
        </ToggleButtonGroup>
        <Button variant='contained' onClick={onDialogClose}>Ok</Button>
      </DialogActions>
    </Dialog>
  </>;
}
