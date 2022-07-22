import React from 'react';
import ReactDOM from 'react-dom/client';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import { RecoilRoot, useRecoilState } from 'recoil';
import { pageState } from './state';
import { LoginPage } from './LoginPage';
import { SignUpPage } from './SignUpPage';
import { StartPage } from './StartPage';

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
  }
});

interface PageProps {
  id: string;
  component: React.ComponentType;
}

function Page({ id, component }: PageProps) {
  const [page, _] = useRecoilState(pageState);
  return page == id ? React.createElement(component) : null;
}

const App = () => (
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline/>
      <RecoilRoot>
        <Page id='login' component={LoginPage} />
        <Page id='signup' component={SignUpPage} />
        <Page id='start' component={StartPage} />
      </RecoilRoot>
    </ThemeProvider>
  </React.StrictMode>
);

ReactDOM.createRoot(document.getElementById('root')!).render(<App/>);
