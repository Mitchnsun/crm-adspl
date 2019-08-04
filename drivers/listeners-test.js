export default function createListener(initialValue) {
  const listeners = [];
  let last = initialValue || null;
  return {
    currentValue: () => last,
    subscribe(cb) {
      listeners.push(cb);
      if (last) {
        cb(last);
      }
      return () => {
        listeners.splice(listeners.indexOf(cb), 1);
      };
    },
    replace(v) {
      last = v;
      this.notify(v);
    },
    updateWithMore(v) {
      last = last.concat(v);
      this.notify(last);
    },
    notify(e) {
      listeners.forEach(f => f(e || last));
    },
  };
}
