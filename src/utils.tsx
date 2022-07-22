import { useEffect } from 'react';

export function useAsyncEffect(effect: () => Promise<any>, deps: any[]) {
  useEffect(() => { effect().catch(console.error); }, deps)
}
