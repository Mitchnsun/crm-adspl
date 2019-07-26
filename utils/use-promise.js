import { useState, useEffect } from 'react';

export default function usePromise(promise, defaultValue) {
  const [data, setData] = useState(defaultValue);
  const [error, setError] = useState(null);

  useEffect(() => {
    promise.then(setData).catch(setError);
  }, []);

  return { data, error };
}
