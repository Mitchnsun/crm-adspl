import { useContext, useEffect } from 'react';
import Layout from '../components/organismes/Layout';
import UserContext from '../utils/UserContext';
import { assign, Machine } from 'xstate';
import { useMachine } from '@xstate/react';

const machine = Machine({
  id: 'users',
  initial: 'idle',
  context: {
    users: [],
    error: null,
  },
  states: {
    idle: {
      on: {
        FETCH_USERS: {
          target: 'loading',
        },
      },
    },
    loading: {
      invoke: {
        src: 'fetchUsers',
        onDone: {
          target: 'success',
          actions: assign({
            users: (_, event) => event.data || [],
            error: () => null,
          }),
        },
        onError: {
          target: 'failure',
          actions: assign({
            error: (_, event) => event.data,
            users: () => [],
          }),
        },
      },
    },
    success: {
      on: {
        ENABLE_USER: 'enablingUser',
        DISABLE_USER: 'disablingUser',
      },
    },
    failure: {
      on: {
        RETRY: 'loading',
      },
    },
    disablingUser: {
      invoke: {
        src: 'disableUser',
        onDone: {
          target: 'success',
          actions: assign({
            users: (context, event) => context.users.map(u => (u.id === event.data.id ? event.data : u)),
            error: () => null,
          }),
        },
        onError: {
          target: 'failure',
          actions: assign({
            error: (_, event) => event.data,
          }),
        },
      },
    },
    enablingUser: {
      invoke: {
        src: 'enableUser',
        onDone: {
          target: 'success',
          actions: assign({
            users: (context, event) => context.users.map(u => (u.id === event.data.id ? event.data : u)),
            error: () => null,
          }),
        },
        onError: {
          target: 'failure',
          actions: assign({
            error: (_, event) => event.data,
          }),
        },
      },
    },
  },
});

function UsersView({ Users }) {
  const user = useContext(UserContext);

  if (!user || !user.isAdmin()) return null;

  const [current, send] = useMachine(machine, {
    services: {
      fetchUsers: () => Users.fetch(),
      enableUser: (_, event) => Users.enable(event.user),
      disableUser: (_, event) => Users.disable(event.user),
    },
  });

  useEffect(() => {
    send('FETCH_USERS');
  }, []);

  console.log('render', current);

  const grouped = Users.groupByStatus(current.context.users.filter(u => u.id !== admin.uid));

  return (
    <div>
      <h2>Users</h2>
      <h3>Actives</h3>
      {grouped.actives.map(user => {
        return (
          <div key={user.id}>
            <span>
              {user.firstname} {user.lastname}
            </span>
            <button onClick={() => send({ type: 'DISABLE_USER', user })}>Inactive</button>
          </div>
        );
      })}

      <h3>Inactives</h3>
      {grouped.inactives.map(user => {
        return (
          <div key={user.id}>
            <span>
              {user.firstname} {user.lastname}
            </span>
            <button onClick={() => send({ type: 'ENABLE_USER', user })}>Active</button>
          </div>
        );
      })}
    </div>
  );
}

export default function admin({ Users }) {
  return (
    <Layout>
      <h1>Admin</h1>
      <UsersView Users={Users} />
    </Layout>
  );
}
