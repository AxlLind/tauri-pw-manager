import React from 'react'
import ReactDOM from 'react-dom/client'
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material'
import { RecoilRoot, atom, useRecoilState } from 'recoil'

const theme = createTheme({
  palette: {
    primary: {
      light: '#649568',
      main: '#149414',
      dark: '#0e6b0e',
    },
  },
});

const pageState = atom({
  key: 'page',
  default: 'login',
});

function PageRouter() {
  const [page, _] = useRecoilState(pageState);
  switch (page) {
  case 'login':
    return <div>Click here to login</div>;
  }
  throw new Error(`Invalid page: ${page}`);
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
