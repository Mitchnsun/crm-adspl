import { useState, useEffect } from 'react';

export default function useObservable(observable, fetchFn, defaultValue) {
  const [data, setData] = useState(observable.currentValue() || defaultValue);
  useEffect(() => {
    fetchFn && fetchFn();
    return observable.subscribe(setData);
  }, []);

  return { data };
}
