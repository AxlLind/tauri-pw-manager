import ReactDOM from 'react-dom/client';
import React, { useState } from 'react';
import { CssBaseline, ThemeProvider, createTheme, Snackbar, Alert, AlertColor, IconButton, Box } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { Page, PageContext } from './utils';
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
    primary: { main: '#ff6ac1' },
    secondary: { main: '#ff6ac1' },
  },
  typography: { fontFamily: 'CascadiaMono' },
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

const backPages = { login: undefined, signup: 'login', start: 'login', add: 'start' };
const pageComponents = { login: LoginPage, signup: SignUpPage, start: StartPage, add: AddPage };

function App() {
  const [page, setPage] = useState('login' as Page);
  const [{ m, severity }, setMessage] = useState({ m: '', severity: 'error' as AlertColor });
  const [showMessage, setShowMessage] = useState(false);
  const goToPage = (page: Page) => {
    setPage(page);
    setShowMessage(false);
  };
  const showAlert = (m: string, severity: AlertColor = 'error') => {
    setMessage({ m, severity });
    setShowMessage(true);
  };
  return <>
    {page !== 'login' && <IconButton children={<ArrowBack/>} sx={{ position: 'fixed', top: 10, left: 10 }} onClick={() => goToPage(backPages[page] as Page)}/>}
    <PageContext.Provider value={{ goToPage, showAlert }}>
      <Box height='100vh' display='flex'>
        <Box margin='auto'>
          {React.createElement(pageComponents[page])}
        </Box>
      </Box>
    </PageContext.Provider>
    <Snackbar open={showMessage} autoHideDuration={3000} onClose={() => setShowMessage(false)}>
      <Alert severity={severity} onClose={() => setShowMessage(false)}>{m}</Alert>
    </Snackbar>
  </>;
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <ThemeProvider theme={theme}>
    <CssBaseline/>
    <App/>
  </ThemeProvider>
);
