import ReactDOM from 'react-dom/client';
import { useState } from 'react';
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

function PageRouter() {
  const [page, goToPage] = useState('login' as Page);
  switch (page) {
  case 'login': return <LoginPage goToPage={goToPage}/>;
  case 'signup': return <SignUpPage goToPage={goToPage}/>;
  case 'start': return <StartPage goToPage={goToPage}/>;
  case 'add': return <AddPage goToPage={goToPage}/>;
  default:
    throw Error(`Invalid page: ${page}`);
  }
}

const App = () => (
  <ThemeProvider theme={theme}>
    <CssBaseline/>
    <PageRouter/>
  </ThemeProvider>
);

ReactDOM.createRoot(document.getElementById('root')!).render(<App/>);
