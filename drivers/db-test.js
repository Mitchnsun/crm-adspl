import { set, get } from 'lodash';
const db = {};

export default function createDb(config) {
  const res = (name, uid) => {
    const path = uid ? name + '.' + uid : name;

    if (!get(db, path)) {
      set(db, path, []);
    }

    let cpt = 0;
    return {
      reset: () => {
        set(db, path, []);
      },
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
        console.debug(name, 'get', id, db[name]);
        const data = get(db, path).find(u => u.id === id) || null;
        return Promise.resolve(data);
      },
      remove(id) {
        set(db, path, get(db, path).filter(d => d.id !== id));
        return Promise.resolve();
      },
      update(data) {
        const newValue = get(db, path).map(d => {
          if (d.id === data.id) {
            return data;
          }
          return d;
        });
        set(db, path, newValue);
        return Promise.resolve(newValue);
      },
    };
  };

  if (config) {
    Object.keys(config).forEach(dbName => {
      const d = res(dbName);
      config[dbName].add.forEach(d.add);
    });
  }

  return res;
}
