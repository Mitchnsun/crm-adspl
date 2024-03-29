import createUser from './User';
import createAdmin from './Admin';
export default function createSession(drivers) {
  let isConnected = false;

  const state = {
    user: null,
  };

  const dbUsers = drivers.db('users');
  return {
    isUserAdmin: () => (state.user ? state.user.isAdmin() : false),
    getCurrentUser: () => state.user,
    login: async (login, password) => {
      const uid = await drivers.auth.login(login, password);
      const user = await dbUsers.get(uid);
      if (!user || !user.isActive) {
        return drivers.auth.logout().then(() => Promise.reject(new Error('User no exist or disabled')));
      }
      drivers.router.onConnect();
      return uid;
    },
    logout: drivers.auth.logout,
    createAccount: params => {
      const requiredValues = ['firstname', 'lastname', 'email', 'password'];
      const errors = requiredValues.map(v => (params[v] ? null : v)).filter(Boolean);

      if (errors.length > 0) {
        return Promise.reject(new Error(`Missing required value! [${errors.join(',')}]`));
      }
      const { firstname, lastname, email, password } = params;
      return drivers.auth.createAccount({ email, password }).then(id => {
        const data = {
          firstname,
          lastname,
          email,
          isActive: false,
          id,
          role: 'agent',
        };
        return fetch(process.env.CRM_API_URL + '/createAccount', {
          method: 'post',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });
      });
    },
    listen: cb => {
      return drivers.auth.listen(async userAuth => {
        if (userAuth) {
          const user = await dbUsers.get(userAuth.uid);
          if (!user || !user.isActive) {
            if (isConnected) {
              drivers.router.onDisconnect();
            }
            isConnected = false;
            state.user = null;
            cb(state);
            return;
          }
          isConnected = true;
          state.user = createUser(drivers)(user, userAuth);
          if (state.user.isAdmin()) {
            state.user = createAdmin(drivers)(state.user);
          }
          cb(state);
        } else {
          isConnected = false;
          drivers.router.onDisconnect();
          state.user = null;
          cb(state);
        }
      });
    },
  };
}
