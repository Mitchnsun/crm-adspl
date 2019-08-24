import React, { useContext } from 'react';
import { Machine, assign } from 'xstate';

import Title from '../components/atoms/Title';
import Layout from '../components/organismes/Layout';
import TableTickets from '../components/molecules/TableTickets';
import { useMachine } from '@xstate/react';
import UserContext from '../utils/UserContext';

const machine = Machine({
  id: 'tickets',
  initial: 'loadingTabWaiting',
  context: {
    data: null,
    error: null,
  },
  states: {
    loadingTabWaiting: {
      invoke: {
        src: 'fetchTabWaiting',
        onDone: {
          target: 'successTabWaiting',
          actions: assign({
            data: (_, event) => event.data,
            error: () => null,
          }),
        },
        onError: {
          target: 'failureTabWaiting',
          actions: assign({
            error: (_, event) => event.data,
            data: () => null,
          }),
        },
      },
    },
    successTabWaiting: {
      on: {
        LOAD_TAB_MINE: 'loadingTabMine',
        LOAD_TAB_ALL: 'loadingTabAll',
      },
    },
    failureTabWaiting: {
      on: {
        RETRY: 'loadingTabWaiting',
      },
    },
    loadingTabMine: {
      invoke: {
        src: 'fetchTabMine',
        onDone: {
          target: 'successTabMine',
          actions: assign({
            data: (_, event) => event.data,
            error: () => null,
          }),
        },
        onError: {
          target: 'failureTabMine',
          actions: assign({
            error: (_, event) => event.data,
            data: () => null,
          }),
        },
      },
    },
    successTabMine: {
      on: {
        LOAD_TAB_WAITING: 'loadingTabWaiting',
        LOAD_TAB_ALL: 'loadingTabAll',
      },
    },
    failureTabMine: {
      on: {
        RETRY: 'loadingTabWaiting',
      },
    },
    loadingTabAll: {
      invoke: {
        src: 'fetchTabAll',
        onDone: {
          target: 'successTabAll',
          actions: assign({
            data: (_, event) => event.data,
            error: () => null,
          }),
        },
        onError: {
          target: 'failureTabAll',
          actions: assign({
            error: (_, event) => event.data,
            data: () => null,
          }),
        },
      },
    },
    successTabAll: {
      on: {
        LOAD_TAB_MINE: 'loadingTabMine',
        LOAD_TAB_WAITING: 'loadingTabWaiting',
        MORE: 'loadingTabAllMore',
      },
    },
    failureTabAll: {
      on: {
        RETRY: 'loadingTabAll',
      },
    },
    loadingTabAllMore: {
      invoke: {
        src: 'fetchTabAllMore',
        onDone: {
          target: 'successTabAllMore',
          actions: assign({
            data: (context, event) => context.data.concat(event.data),
            error: () => null,
          }),
        },
        onError: {
          target: 'failureTabAllMore',
          actions: assign({
            error: (_, event) => event.data,
            data: () => null,
          }),
        },
      },
    },
    successTabAllMore: {
      on: {
        LOAD_TAB_MINE: 'loadingTabMine',
        LOAD_TAB_WAITING: 'loadingTabWaiting',
        MORE: 'loadingTabAllMore',
      },
    },
    failureTabAllMore: {
      on: {
        RETRY: 'loadingTabAllMore',
      },
    },
  },
});

const render = (current, send) => {
  switch (current.value || '') {
    case 'loadingTabWaiting':
    case 'loadingTabMine':
    case 'loadingTabAll':
      return <p>Loading...</p>;
    case 'failureTabWaiting':
    case 'failureTabMine':
    case 'failureTabAll':
      return (
        <div>
          <p>Une erreur est survenue</p>
          <button onClick={() => send('RETRY')}>Ré-essayé</button>
        </div>
      );
    case 'successTabWaiting':
    case 'successTabMine':
    case 'successTabAll':
    case 'successTabAllMore':
    case 'loadingTabAllMore':
      const loadMore = ['successTabAll', 'successTabAllMore'].includes(current.value);
      return (
        <React.Fragment>
          <TableTickets tickets={current.context.data} />
          {loadMore && <button onClick={() => send('MORE')}>MORE</button>}
        </React.Fragment>
      );
    default:
      return null;
  }
};

function TicketsView({ Tickets }) {
  const user = useContext(UserContext);
  const [current, send] = useMachine(machine, {
    services: {
      fetchTabWaiting: () => Tickets.getAll({ status: 'PENDING' }),
      fetchTabMine: () => Tickets.getAll({ followedBy: user, status: 'IN_PROGRESS' }),
      fetchTabAll: () => Tickets.getAll({ limit: 10 }),
      fetchTabAllMore: context =>
        Tickets.getAll({
          limit: 10,
          startAfter: context.data && context.data[context.data.length - 1],
        }),
    },
  });

  const waitingTab = ['loadingTabWaiting', 'successTabWaiting', 'failureTabWaiting'].includes(current.value);
  const mineTab = ['loadingTabMine', 'successTabMine', 'failureTabMine'].includes(current.value);
  const allTab = [
    'loadingTabAll',
    'successTabAll',
    'failureTabAll',
    'loadingTabAllMore',
    'successTabAllMore',
    'failureTabAllMore',
  ].includes(current.value);

  return (
    <React.Fragment>
      <div>
        <button className={waitingTab ? 'active' : ''} onClick={() => send('LOAD_TAB_WAITING')}>
          WAITING
        </button>
        <button className={mineTab ? 'active' : ''} onClick={() => send('LOAD_TAB_MINE')}>
          MINE
        </button>
        <button className={allTab ? 'active' : ''} onClick={() => send('LOAD_TAB_ALL')}>
          ALL
        </button>
      </div>
      {render(current, send)}
      <style jsx>{`
        .active {
          background-color: red;
        }
      `}</style>
    </React.Fragment>
  );
}

export default function Index({ Tickets, user }) {
  return (
    <Layout>
      <Title type="primary">My Tickets</Title>
      <TicketsView Tickets={Tickets} user={user} />
    </Layout>
  );
}
