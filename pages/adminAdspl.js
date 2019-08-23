import Layout from '../components/organismes/Layout';

import { useRef, useContext } from 'react';
import { Machine, assign } from 'xstate';
import { useMachine } from '@xstate/react';
import { AdsplOverview } from '../components/organismes/AdsplOverview';
import UserContext from '../utils/UserContext';
import { render } from '../utils/render-machine';

const machine = Machine({
  id: 'fetch',
  initial: 'idle',
  context: {
    data: null,
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
            data: (_, event) => event.data,
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

export default function adminAdspl({ Adspl }) {
  const user = useContext(UserContext);
  const [current, send] = useMachine(machine, {
    services: {
      fetchData: (context, event) => Adspl.getDetails(event.id, user),
    },
    guards: {
      searchValid: (context, event) => Adspl.validateId(event.id),
    },
  });

  const idRef = useRef(null);
  return (
    <Layout>
      <div>
        <input type="text" ref={idRef} placeholder="Siret/Siren" />
        <button onClick={() => send({ type: 'SEARCH', id: idRef.current.value })}>GO</button>
      </div>

      {render(current, {
        searching: () => <p>loading...</p>,
        success: () => {
          idRef.current.value = '';
          return <AdsplOverview data={current.context.data} />;
        },
        failure: () => <p>{current.context.error}</p>,
      })}
    </Layout>
  );
}
