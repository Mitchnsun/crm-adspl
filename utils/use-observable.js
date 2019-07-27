import { useState, useEffect } from 'react';

export default function useObservable(observable, fetchFn) {
  const [data, setData] = useState(observable.currentValue());
  useEffect(() => {
    fetchFn && fetchFn();
    return observable.subscribe(setData, 'useObservable');
  }, [observable]);

  return { data };
}
