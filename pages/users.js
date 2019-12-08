import { useContext, useEffect } from 'react';
import Layout from '../components/organismes/Layout';
import UserContext from '../utils/UserContext';
import { assign, Machine } from 'xstate';
import { useMachine } from '@xstate/react';
import DomainsContext from '../utils/DomainsContext';
import Link from '../components/atoms/Link';

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

function UsersView() {
  const { Users } = useContext(DomainsContext);
  const currentUser = useContext(UserContext);

  if (!currentUser || !currentUser.isAdmin()) return null;

  const [current, send] = useMachine(machine, {
    services: {
      fetchUsers: () => Users.fetch(),
      enableUser: (_, event) => Users.enable(event.user, currentUser),
      disableUser: (_, event) => Users.disable(event.user, currentUser),
    },
  });

  useEffect(() => {
    send('FETCH_USERS');
  }, []);

  return (
    <div>
      <table>
        <thead>
          <tr>
            <th>Nom</th>
            <th>Etat</th>
            <th>Groupes</th>
          </tr>
        </thead>
        <tbody>
          {current.context.users.map(user => {
            return (
              <tr key={user.id}>
                <td className="name">
                  <Link url={'/user?uid=' + user.id} as={'/users/' + user.id}>
                    {user.firstname} {user.lastname}
                  </Link>
                </td>
                <td className={user.isActive ? 'bg-green' : 'bg-red'}>
                  <input
                    type="checkbox"
                    disabled={user.id === currentUser.id}
                    checked={user.isActive}
                    onClick={() => {
                      if (user.isActive) {
                        send({ type: 'DISABLE_USER', user });
                      } else {
                        send({ type: 'ENABLE_USER', user });
                      }
                    }}
                  />{' '}
                  {user.isActive ? 'Actif' : 'Inactif'}
                </td>
                <td>
                  <span>
                    {['adspl'].map(group => (
                      <span>
                        <input type="checkbox" checked={(user.groups || []).find(g => g === group)} /> {group}
                      </span>
                    ))}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <style jsx>
        {`
          .name {
            font-weight: bold;
          }
          .bg-red {
            background-color: red;
            color: white;
          }
          .bg-green {
            background-color: green;
            color: white;
          }
          td {
            padding: 0.3rem 1rem;
          }
          td {
            border: 1px solid silver;
          }
        `}
      </style>
    </div>
  );
}

export default function users() {
  return (
    <Layout>
      <UsersView />
    </Layout>
  );
}
