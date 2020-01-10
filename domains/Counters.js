export default function createCounters(drivers) {
  const dbCounters = drivers.db('counters');

  return {
    of(name) {
      return {
        get() {
          return dbCounters.get(name).then((value = 0) => {
            return dbCounters.updatePath(name, value + 1);
          });
        },
      };
    },
  };
}
