import { useRecoilState } from 'recoil'
import { pageState } from './state';

function LoginPage() {
  const [_, goToPage] = useRecoilState(pageState);
  return (
    <div>
      <h1>Tauri PW Manager</h1>
      <button onClick={() => goToPage("start")}>Login</button>
    </div>
  );
}

export { LoginPage };
