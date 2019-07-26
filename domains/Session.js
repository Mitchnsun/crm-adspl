import createUser from './User';
export default function createSession(drivers) {
  let isConnected = false;

  const state = {
    user: null,
  };

  const listeners = drivers.createListener();

  let unsub = drivers.auth.listen(user => {
    if (user) {
      isConnected = true;
      drivers.router.onConnect();
      state.user = createUser(drivers)(user.uid);
      listeners.notify(state);
    } else {
      if (isConnected) {
        isConnected = false;
        drivers.router.onDisconnect();
        state.user = null;
        listeners.notify(state);
      }
    }
  });

  return {
    login: drivers.auth.login,
    logout: drivers.auth.logout,
    listen: listeners.subscribe,
    unsub,
  };
}