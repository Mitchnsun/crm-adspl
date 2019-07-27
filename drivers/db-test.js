import { set, get } from 'lodash';
const db = {};

export default function createDb() {
  return (name, uid) => {
    const path = uid ? name + '.' + uid : name;

    if (!get(db, path)) {
      set(db, path, []);
    }

    let cpt = 0;
    return {
      generateId() {
        return path + cpt++;
      },
      getAll() {
        return Promise.resolve(get(db, path) || []);
      },
      add(data) {
        const actual = get(db, path) || [];
        set(db, path, actual.concat([data]));
        return Promise.resolve();
      },
      get(id) {
        const data = get(db, path + '.' + id);
        return data ? Promise.resolve(data) : Promise.reject(new Error('Not found'));
      },
      remove(id) {
        set(db, path, get(db, path).filter(d => d.id !== id));
        return Promise.resolve();
      },
      update(datas, event) {
        const newValue = get(db, path).map(d => {
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
        set(db, path, newValue);
        return Promise.resolve(newValue);
      },
    };
  };
}
