import Layout from '../components/organismes/Layout';
import { useRouter } from 'next/router';
import { useRef, useContext, useEffect } from 'react';
import { Machine, assign } from 'xstate';
import { useMachine } from '@xstate/react';
import { AdsplOverview } from '../components/organismes/AdsplOverview';
import UserContext from '../utils/UserContext';
import { render } from '../utils/render-machine';
import colors from '../styles/colors';
import DomainsContext from '../utils/DomainsContext';
import { AdsplMenu } from '../components/molecules/AdsplMenu';

const machine = Machine({
  id: 'fetch',
  initial: 'idle',
  context: {
    data: null,
    tickets: null,
    error: null,
  },
  states: {
    idle: {
      on: {
        SEARCH: {
          target: 'searching',
          cond: 'searchValid',
        },
      },
    },
    searching: {
      invoke: {
        src: 'fetchData',
        onDone: {
          target: 'success',
          actions: assign({
            data: (_, event) => event.data[0],
            tickets: (_, event) => event.data[1],
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
    success: {
      on: {
        SEARCH: {
          target: 'searching',
          cond: 'searchValid',
        },
      },
    },
    failure: {
      on: {
        SEARCH: {
          target: 'searching',
          cond: 'searchValid',
        },
      },
    },
  },
});

export default function adspl() {
  const { Adspl, Tickets } = useContext(DomainsContext);
  const user = useContext(UserContext);
  const router = useRouter();
  const { id } = router.query;

  const [current, send] = useMachine(machine, {
    services: {
      fetchData: (context, event) =>
        Promise.all([Adspl.getDetails(event.id, user), Tickets.getAll({ scope: 'adspl', adsplId: event.id })]),
    },
    guards: {
      searchValid: (context, event) => Adspl.validateId(event.id),
    },
  });

  useEffect(() => {
    if (id) {
      send({ type: 'SEARCH', id });
    }
  }, []);

  const idRef = useRef(id);
  return (
    <Layout>
      <AdsplMenu />
      <div>
        <input type="text" ref={idRef} placeholder="Siret/Siren" defaultValue={id} />
        <button onClick={() => send({ type: 'SEARCH', id: idRef.current.value })}>GO</button>
        <style jsx>{`
          input {
            padding: 0.5rem;
            border-radius: 5px 0 0 5px;
            border: 1px solid ${colors.SKY_DARK};
          }
          button {
            padding: 0.5rem;
            border-radius: 0 5px 5px 0;
            border: 1px solid ${colors.SKY_DARK};
            background-color: ${colors.SKY_DARK};
            color: white;
          }
        `}</style>
      </div>

      {render(current, {
        searching: () => <p>Chargement...</p>,
        success: () => {
          if (current.context.data) {
            return <AdsplOverview data={current.context.data} tickets={current.context.tickets} />;
          }
          return 'Pas de données';
        },
        failure: () => <p>{current.context.error}</p>,
      })}
    </Layout>
  );
}
