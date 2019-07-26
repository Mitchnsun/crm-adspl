export default function createListener() {
  const listeners = [];
  return {
    subscribe(cb) {
      listeners.push(cb);
      return () => {
        listeners.splice(listeners.indexOf(cb), 1);
      };
    },
    notify(e) {
      listeners.forEach(f => f(e));
    },
  };
}
