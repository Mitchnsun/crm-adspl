export function createAnalytics(drivers) {
  return {
    log(event, category, label, value) {
      try {
        return drivers.analytics.send({ event, category, label, value });
      } catch (e) {
        console.warn(e);
      }
    },
  };
}
