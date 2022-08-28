import { useContext, useState } from 'react';
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Paper, Slider, Stack, TextField, ToggleButton, ToggleButtonGroup, Tooltip, Typography } from '@mui/material';
import { Loop } from '@mui/icons-material';
import { PageContext, PasswordField, useAsyncEffect } from './utils';
import { add_credentials, generate_password } from './backend';

const pwCharColor = (c: string) => '!@#$%^&*'.includes(c) ? '#57c7ff' : '0123456789'.includes(c) ? '#ffbc58' : '#ffffff';

export function AddPage() {
  const { goToPage, showAlert } = useContext(PageContext);
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [openTooltip, setOpenToolip] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [length, setLength] = useState(16);
  const [types, setTypes] = useState(['lowercase', 'uppercase', 'digits', 'special']);

  useAsyncEffect(async () => {
    if (!openDialog) return;
    const res = await generate_password(length, types);
    if (!res.ok) return showAlert(res.error);
    setPassword(res.value);
  }, [openDialog, length, types]);

  const onClickAddCredentials = async () => {
    if (name === '') return showAlert('Name missing.');
    if (username === '') return showAlert('Username missing.');
    if (password === '') return showAlert('Password missing.');
    const res = await add_credentials(name, username, password);
    if (!res.ok) return showAlert(res.error);
    goToPage('start');
  };

  return <>
    <Stack spacing={3} alignItems='center' onKeyDown={e => !openDialog && e.key == 'Enter' && onClickAddCredentials()}>
      <Typography variant='h5'>Add Credentials</Typography>
      <TextField label='Name' value={name} onChange={e => setName(e.target.value)}/>
      <TextField label='Username' value={username} onChange={e => setUsername(e.target.value)}/>
      <Box>
        <PasswordField label='Password' value={password} onChange={setPassword}/>
        <Tooltip title='Generate password' disableHoverListener onMouseEnter={() => setOpenToolip(true)} onMouseLeave={() => setOpenToolip(false)} open={!openDialog && openTooltip}>
          <IconButton children={<Loop/>} sx={{position: 'absolute', transform: 'translateY(8px)'}} onClick={() => setOpenDialog(true)}/>
        </Tooltip>
      </Box>
      <Button variant='contained' onClick={onClickAddCredentials}>Add</Button>
    </Stack>
    <Dialog open={openDialog} onClose={() => setOpenDialog(false)} onKeyDown={e => e.key == 'Enter' && setOpenDialog(false)}>
      <DialogTitle textAlign='center'>Generate Password</DialogTitle>
      <DialogContent sx={{ margin: '0 1rem 0 1rem' }}>
        <Paper sx={{ width: '25rem', padding:'1rem', display: 'flex', justifyContent: 'center' }}>
          {[...password.length <= 39 ? password : `${password.substring(0, 39-3)}...`].map(c => <span style={{ color: pwCharColor(c) }}>{c}</span>)}
        </Paper>
        <Slider sx={{ width: '24rem', marginLeft: '0.5rem', marginTop: '1rem'}} value={length} min={10} max={128} marks={[{ value: length, label: length }]} onChange={(_, value) => setLength(value as number)}/>
      </DialogContent>
      <DialogActions style={{ justifyContent: 'space-between', margin: "0 3rem 1rem 3rem" }}>
        <Tooltip title='toggle included characters'>
          <ToggleButtonGroup value={types} onChange={(_, value) => value.length && setTypes(value)}>
            {[['lowercase', 'a-z'], ['uppercase', 'A-Z'], ['digits', '0-9'], ['special', '!@#$%^&*']].map(([value, text]) =>
              <ToggleButton disableRipple value={value} sx={{ textTransform: 'none' }}>
                <Typography>{text}</Typography>
              </ToggleButton>
            )}
          </ToggleButtonGroup>
        </Tooltip>
        <Button variant='contained' onClick={() => setOpenDialog(false)}>Ok</Button>
      </DialogActions>
    </Dialog>
  </>;
}
