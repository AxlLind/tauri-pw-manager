import ReactDOM from 'react-dom/client';
import React, { useState } from 'react';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import { Page } from './utils';
import { LoginPage } from './LoginPage';
import { SignUpPage } from './SignUpPage';
import { StartPage } from './StartPage';
import { AddPage } from './AddPage';

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
    fontFamily: 'Cascadia Code'
  },
  components: {
    MuiTextField: {
      defaultProps: {
        spellCheck: false
      }
    }
  }
});

const pages = { login: LoginPage, signup: SignUpPage, start: StartPage, add: AddPage };

function PageRouter() {
  const [page, goToPage] = useState('login' as Page);
  return React.createElement(pages[page], { goToPage });
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <ThemeProvider theme={theme}>
    <CssBaseline/>
    <PageRouter/>
  </ThemeProvider>
);
