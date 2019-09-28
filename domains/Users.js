export default function createUsers(drivers) {
  const dbUsers = drivers.db('users');

  const names = {};
  return {
    getFullname(id) {
      return names[id] || id;
    },
    prefetchNames() {
      return dbUsers
        .getAll()
        .then(a => a || [])
        .then(list => {
          list.forEach(u => {
            names[u.id] = u.firstname + ' ' + u.lastname;
          });
        });
    },
    fetch() {
      return dbUsers.getAll().then(a => a || []);
    },
    get(id) {
      return dbUsers.get(id);
    },
    enable(user) {
      return dbUsers.update({
        ...user,
        isActive: true,
        _history: (user._history || []).concat([
          { update: 'isActive', with: true, was: user.isActive, on: new Date().toISOString() },
        ]),
      });
    },
    disable(user) {
      return dbUsers.update({
        ...user,
        isActive: false,
        _history: (user._history || []).concat([
          { update: 'isActive', with: false, was: user.isActive, on: new Date().toISOString() },
        ]),
      });
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
