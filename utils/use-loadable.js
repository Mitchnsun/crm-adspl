import { useState, useEffect } from 'react';

export default function useLoadable(Domain, options = {}) {
  const [data, setData] = useState(Domain.defaultValue);
  const [fetchMore, setFetchMore] = useState(() => {});

  useEffect(() => {
    const domain = Domain.new();
    const observable = domain.getObservable();
    domain.fetch({
      limit: options.limit,
      follower: options.followedBy && options.followedBy.id,
      status: options.status,
    });
    setFetchMore(() => () =>
      domain.fetchMore({
        limit: options.limit,
        follower: options.followedBy && options.followedBy.id,
        status: options.status,
      }),
    );
    return observable.subscribe(setData);
  }, []);

  return { data, fetchMore };
}
