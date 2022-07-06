import React from 'react';
import ReactDOM from 'react-dom/client';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import { RecoilRoot, useRecoilState } from 'recoil';
import { pageState } from './state';
import { LoginPage } from './LoginPage';

const theme = createTheme({
  palette: {
    primary: {
      light: '#649568',
      main: '#149414',
      dark: '#0e6b0e',
    },
  },
});

function PageRouter() {
  const [page, _] = useRecoilState(pageState);
  switch (page) {
  case 'login':
    return <LoginPage/>;
  case 'start':
    return <div>You are logged in</div>;
  default:
    throw new Error(`Invalid page: ${page}`);
  }
}

const App = () => (
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline/>
      <RecoilRoot>
        <PageRouter/>
      </RecoilRoot>
    </ThemeProvider>
  </React.StrictMode>
);

ReactDOM.createRoot(document.getElementById('root')!).render(<App/>);
