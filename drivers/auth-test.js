import createListener from './listeners-test';

export default function createDriver() {
  const listeners = createListener();
  return {
    login() {
      console.log('login');
      listeners.notify({
        uid: '1234567',
        role: 'admin',
      });
    },

    logout() {
      console.log('logout');
      listeners.notify(null);
    },

    listen: listeners.subscribe,
  };
}
