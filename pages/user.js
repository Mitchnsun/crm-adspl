import { useContext, useEffect } from 'react';
import Layout from '../components/organismes/Layout';
import Link from '../components/atoms/Link';
import DomainsContext from '../utils/DomainsContext';
import { assign, Machine } from 'xstate';
import { useMachine } from '@xstate/react';
import { ActivitiesBlock } from '../components/widgets/ActivitiesBlock';

const machine = Machine({
  id: 'user',
  initial: 'idle',
  context: {
    user: null,
    error: null,
  },
  states: {
    idle: {
      on: {
        FETCH_USER: {
          target: 'loading',
        },
      },
    },
    loading: {
      invoke: {
        src: 'fetchUser',
        onDone: {
          target: 'success',
          actions: assign({
            user: (_, event) => event.data,
            error: () => null,
          }),
        },
        onError: {
          target: 'failure',
          actions: assign({
            error: (_, event) => event.data,
            user: () => null,
          }),
        },
      },
    },
    success: {},
    failure: {
      on: {
        RETRY: 'loading',
      },
    },
  },
});

export default function user({ uid }) {
  const { Users } = useContext(DomainsContext);

  const [current, send] = useMachine(machine, {
    services: {
      fetchUser: () => {
        return Users.get(uid);
      },
    },
  });

  useEffect(() => {
    send('FETCH_USER');
  }, []);

  if (!current.context.user) return null;
  const user = current.context.user;

  console.log('current', current);
  return (
    <Layout>
      <Link url="/users">Back</Link>
      <h2>Présentation</h2>
      <div>
        {user.firstname} {user.lastname}
      </div>
      <div>Groupes: {(user.groups || []).join(', ')}</div>
      <div>{user.isActive ? 'Actif' : 'Inactif'}</div>
      <hr />
      <h2>Activités</h2>
      <ActivitiesBlock userId={user.id} />
    </Layout>
  );
}

user.getInitialProps = async function(context) {
  const { uid } = context.query;
  return { uid };
};
