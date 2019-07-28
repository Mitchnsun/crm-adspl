import createListener from './listeners-test';
import createDb from './db-test';

export default function createDriver() {
  const listeners = createListener();

  const db = createDb();
  const dbAgents = db('agents');

  return {
    login(login, password) {
      let user = null;

      if (login === 'agent' && password === 'coulson') {
        user = {
          uid: '1234',
          role: 'agent',
        };
      }

      if (login === 'jar' && password === 'vis') {
        user = {
          uid: '1234',
          role: 'admin',
        };
      }

      if (!user) {
        return Promise.reject(new Error('User not found'));
      }

      listeners.notify(user);
      return Promise.resolve(user);
    },

    logout() {
      listeners.notify(null);
      return Promise.resolve();
    },

    createAccount(params) {
      return dbAgents.add({ id: dbAgents.generateId(), ...params });
    },

    listen: listeners.subscribe,
  };
}
