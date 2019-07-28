export default function createUsers(drivers) {
  const dbUsers = drivers.db('users');
  const users = drivers.createListener([], 'createAdmin');

  return {
    fetch() {
      return dbUsers.getAll().then(a => {
        users.replace(a || []);
        return a || [];
      });
    },
    getObservable() {
      return users;
    },
    get(id) {
      return dbUsers.get(id);
    },
    enable(user) {
      return dbUsers
        .update({
          ...user,
          isActive: true,
          _history: (user._history || []).concat([
            { update: 'isActive', with: true, was: user.isActive, on: new Date().toISOString() },
          ]),
        })
        .then(a => users.replace(a));
    },
    disable(user) {
      return dbUsers
        .update({
          ...user,
          isActive: false,
          _history: (user._history || []).concat([
            { update: 'isActive', with: false, was: user.isActive, on: new Date().toISOString() },
          ]),
        })
        .then(a => users.replace(a));
    },
    groupByStatus: data =>
      data.reduce(
        (r, user) => {
          if (user.isActive) r.actives.push(user);
          else r.inactives.push(user);
          return r;
        },
        { actives: [], inactives: [] },
      ),
  };
}
