export default function createUsers(drivers, Activities) {
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
    updateGroups(groups, user, agent) {
      const event = {
        type: 'update-groups',
        with: groups,
        was: user.groups || [],
        on: new Date().toISOString(),
        by: agent.id,
      };

      return Activities.log({ scope: 'crm', event, userId: user.id }, agent).then(() => {
        return dbUsers.update({
          ...user,
          groups,
          _history: (user._history || []).concat([event]),
        });
      });
    },
    enable(user, agent) {
      const event = {
        type: 'update-isActive',
        with: true,
        was: user.isActive,
        on: new Date().toISOString(),
        by: agent.id,
      };
      return Activities.log({ scope: 'crm', event, userId: user.id }, agent).then(() => {
        return dbUsers.update({
          ...user,
          isActive: true,
          _history: (user._history || []).concat([event]),
        });
      });
    },
    disable(user, agent) {
      const event = {
        type: 'update-isActive',
        with: false,
        was: user.isActive,
        on: new Date().toISOString(),
        by: agent.id,
      };
      return Activities.log({ scope: 'crm', event, userId: user.id }, agent).then(() => {
        return dbUsers.update({
          ...user,
          isActive: false,
          _history: (user._history || []).concat([event]),
        });
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
