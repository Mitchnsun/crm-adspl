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
      getAll(paginationConfig = {}) {
        let result = get(db, path) || [];

        result.sort((a, b) => {
          if (a.createAt === b.createAt) return 0;
          return b.createAt - a.createAt;
        });

        if (name === 'tickets' || name === 'test') {
          if (paginationConfig.follower) {
            result = result.filter(r => r.followers.includes(paginationConfig.follower));
          }

          if (paginationConfig.status) {
            result = result.filter(r => r.status === paginationConfig.status);
          }
        }

        if (paginationConfig.startAfter) {
          const i = result.indexOf(paginationConfig.startAfter);
          result = result.slice(i + 1);
        }

        if (paginationConfig.limit) {
          result = result.slice(0, paginationConfig.limit);
        }

        return Promise.resolve(result);
      },
      add(data) {
        const actual = get(db, path) || [];
        if (name === 'tickets' || name === 'test') {
          set(db, path, actual.concat([{ followers: [], status: 'PENDING', ...data }]));
        } else {
          set(db, path, actual.concat([data]));
        }

        return Promise.resolve();
      },
      get(id) {
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
