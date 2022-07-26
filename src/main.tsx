import React from 'react';
import ReactDOM from 'react-dom/client';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import { RecoilRoot, useRecoilValue } from 'recoil';
import { pageState } from './state';
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

const PageRoute = ({ page, component }: { page: Page, component: React.ComponentType }) => (
  useRecoilValue(pageState) == page ? React.createElement(component) : null
);

const App = () => (
  <ThemeProvider theme={theme}>
    <CssBaseline/>
    <RecoilRoot>
      <PageRoute page='login' component={LoginPage} />
      <PageRoute page='signup' component={SignUpPage} />
      <PageRoute page='start' component={StartPage} />
      <PageRoute page='add' component={AddPage} />
    </RecoilRoot>
  </ThemeProvider>
);

ReactDOM.createRoot(document.getElementById('root')!).render(<App/>);
