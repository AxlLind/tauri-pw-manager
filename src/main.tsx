import React from 'react';
import ReactDOM from 'react-dom/client';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import { RecoilRoot, useRecoilState } from 'recoil';
import { pageState } from './state';
import { LoginPage } from './LoginPage';

// TODO: add theme
const theme = createTheme({});

interface RouteProps {
  page: string;
  component: React.ComponentType;
}

function Route({ page, component }: RouteProps) {
  const [currentPage, _] = useRecoilState(pageState);
  return page == currentPage ? React.createElement(component) : null;
}

const App = () => (
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline/>
      <RecoilRoot>
        <Route page='login' component={LoginPage} />
        <Route page='start' component={() => <div>Hello world</div>} />
      </RecoilRoot>
    </ThemeProvider>
  </React.StrictMode>
);

ReactDOM.createRoot(document.getElementById('root')!).render(<App/>);
