import createListener from './listeners-test';
import createDb from './db-test';

let cpt = 0;
export default function createDriver(config = {}) {
  const listeners = createListener();

  const db = createDb()('auth');

  if (config.add) {
    config.add.forEach(db.add);
  }

  return {
    async login(login, password) {
      try {
        const user = await db.get(login);
        if (user.password !== password) {
          return Promise.reject(new Error('Wrong password'));
        }
        listeners.notify({ uid: user.uid });
        return Promise.resolve(user.uid);
      } catch (e) {
        return Promise.reject(new Error('User not found'));
      }
    },

    logout() {
      listeners.notify(null);
      return Promise.resolve();
    },

    createAccount({ email, password }) {
      const uid = cpt++;

      return db.add({ id: email, uid, password }).then(() => {
        listeners.notify({ uid });
        return uid;
      });
    },

    listen: listeners.subscribe,
  };
}
