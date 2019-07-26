const db = {};

export default function createDb() {
  return (name, uid) => {
    if (!db[name]) {
      db[name] = {};
    }

    let cpt = 0;
    return {
      generateId() {
        return name + cpt++;
      },
      getAll() {
        return Promise.resolve(db[name][uid] || []);
      },
      add(data) {
        if (!db[name][uid]) {
          db[name][uid] = [];
        }
        db[name][uid] = db[name][uid].concat([data]);
        return Promise.resolve();
      },
      remove(id) {
        db[name] = db[name][uid].filter(d => d.id !== id);
        return Promise.resolve();
      },
      update(datas, event) {
        db[name][uid] = db[name][uid].map(d => {
          if (d.id === datas.id) {
            const date = new Date();
            return {
              ...datas,
              [event.field]: event.value,
              _history: (datas._history || []).concat([
                {
                  ...event,
                  _date: date,
                },
              ]),
              _lastUpdate: date,
            };
          }
          return d;
        });
        return Promise.resolve();
      },
    };
  };
}
