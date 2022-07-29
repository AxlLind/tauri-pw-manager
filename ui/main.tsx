import ReactDOM from 'react-dom/client';
import React, { useState } from 'react';
import { CssBaseline, ThemeProvider, createTheme, Snackbar, Alert } from '@mui/material';
import { Page, Message } from './utils';
import { LoginPage } from './LoginPage';
import { SignUpPage } from './SignUpPage';
import { StartPage } from './StartPage';
import { AddPage } from './AddPage';
// @ts-ignore
import CascadiaMono from '../assets/CascadiaMono.woff2';

const theme = createTheme({
  palette: {
    mode: 'dark',
    background: {
      default: '#282a36',
      paper: '#2c2f3d',
    },
    text: {
      primary: '#ffffff',
      secondary: '#57c7ff',
      disabled: 'rgba(255, 255, 255, 0.5)'
    },
    primary: {
      main: '#ff6ac1'
    },
    secondary: {
      main: '#ff6ac1'
    },
  },
  typography: {
    fontFamily: 'CascadiaMono'
  },
  components: {
    MuiTextField: {
      defaultProps: {
        spellCheck: false
      },
      styleOverrides: {
        root: {
          minWidth: '300px'
        }
      }
    },
    MuiCssBaseline: {
      styleOverrides: `
        @font-face {
          font-family: 'CascadiaMono';
          src: url(${CascadiaMono}) format('woff2');
        }
      `,
    },
  }
});

const pages = { login: LoginPage, signup: SignUpPage, start: StartPage, add: AddPage };

function PageRouter() {
  const [page, goToPage] = useState('login' as Page);
  const [message, setMessage] = useState({} as Message);
  const [showMessage, setShowMessage] = useState(false);
  const showAlert = (m: string | Message) => {
    setMessage(typeof m === 'string' ? { message: m } : m);
    setShowMessage(true);
  };
  return <>
    {React.createElement(pages[page], { goToPage, showAlert })}
    <Snackbar open={showMessage} autoHideDuration={3000} onClose={() => setShowMessage(false)}>
      <Alert severity={message.severity || 'error'} onClose={() => setShowMessage(false)}>{message.message}</Alert>
    </Snackbar>
  </>;
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <ThemeProvider theme={theme}>
    <CssBaseline/>
    <PageRouter/>
  </ThemeProvider>
);
