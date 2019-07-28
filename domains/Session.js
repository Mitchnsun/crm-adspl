import createUser from './User';
import createAdmin from './Admin';
export default function createSession(drivers) {
  let isConnected = false;

  const state = {
    user: null,
  };

  const listeners = drivers.createListener(state);

  let unsub = drivers.auth.listen(user => {
    if (user) {
      isConnected = true;
      drivers.router.onConnect();
      state.user = createUser(drivers)(user.uid, user.role);
      if (state.user.isAdmin()) {
        state.user = createAdmin(drivers)(state.user);
      }
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
    isUserAdmin: () => (state.user ? state.user.isAdmin() : false),
    getCurrentUser: () => state.user,
    login: drivers.auth.login,
    logout: drivers.auth.logout,
    createAccount: params => {
      const requiredValues = ['firstname', 'lastname', 'email', 'password'];
      const errors = requiredValues.map(v => (params[v] ? null : v)).filter(Boolean);

      if (errors.length > 0) {
        return Promise.reject(new Error(`Missing required value! [${errors.join(',')}]`));
      }
      return drivers.auth.createAccount({ ...params, isActive: false });
    },
    listen: listeners.subscribe,
    unsub,
  };
}
