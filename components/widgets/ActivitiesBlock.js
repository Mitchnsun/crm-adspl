import { useContext, useEffect, useState } from 'react';
import moment from 'moment';
import { assign, Machine } from 'xstate';
import DomainsContext from '../../utils/DomainsContext';
import { useMachine } from '@xstate/react';
import UserContext from '../../utils/UserContext';
import Link from '../atoms/Link';
import colors from '../../styles/colors';

const machine = Machine({
  id: 'activities',
  initial: 'idle',
  context: {
    activities: [],
    error: null,
  },
  states: {
    idle: {
      on: {
        FETCH: {
          target: 'loading',
        },
      },
    },
    loading: {
      invoke: {
        src: 'fetch',
        onDone: {
          target: 'success',
          actions: assign({
            activities: (_, event) => event.data || [],
            error: () => null,
          }),
        },
        onError: {
          target: 'failure',
          actions: assign({
            error: (_, event) => event.data,
            activities: () => [],
          }),
        },
      },
    },
    success: {
      on: {
        FETCH: 'loading',
      },
    },
    failure: {
      on: {
        RETRY: 'loading',
      },
    },
  },
});

function getLabel(key, scope) {
  switch (key) {
    case 'infos-update':
      if (scope === 'adspl') {
        return 'Mise à jour des informations du siret: ';
      }
    default:
      return key;
  }
}

export function ActivitiesBlock({ userId }) {
  const { Activities } = useContext(DomainsContext);
  const user = useContext(UserContext);
  const [date, setDate] = useState(moment().format('DD_MM_YYYY'));

  const [current, send] = useMachine(machine, {
    services: {
      fetch: (_, event) => {
        return Activities.getActivities(event.date, userId, user);
      },
    },
  });

  useEffect(() => {
    send({ type: 'FETCH', date });
  }, [date]);

  return (
    <div>
      <div>
        <button
          style={{ backgroundColor: 'white', border: 'solid silver 1px', borderRadius: '5px', cursor: 'pointer' }}
          onClick={() =>
            setDate(
              moment(date, 'DD_MM_YYYY')
                .subtract(1, 'day')
                .format('DD_MM_YYYY'),
            )
          }
        >
          Précédent
        </button>
        <span style={{ margin: '0 1rem' }}>{moment(date, 'DD_MM_YYYY').format('DD MMM YYYY')}</span>
        <button
          style={{ backgroundColor: 'white', border: 'solid silver 1px', borderRadius: '5px', cursor: 'pointer' }}
          onClick={() =>
            setDate(
              moment(date, 'DD_MM_YYYY')
                .add(1, 'day')
                .format('DD_MM_YYYY'),
            )
          }
        >
          Suivant
        </button>
      </div>
      <br />
      {current.context.activities.length === 0 && <p>Pas d'activités</p>}
      <table>
        <tbody>
          {current.context.activities.map(activity => (
            <tr key={activity.date}>
              <td>
                <span
                  style={{
                    border: 'solid 1px ' + colors.SKY_DARK,
                    backgroundColor: colors.SKY_DARK,
                    color: 'white',
                    borderRadius: '5px',
                    padding: '2px 10px',
                  }}
                >
                  {moment(activity.date).format('DD/MM/YYYY HH:mm:ss')}
                </span>
              </td>
              <td>
                <span
                  style={{
                    border: 'solid 1px purple',
                    backgroundColor: 'purple',
                    color: 'white',
                    borderRadius: '5px',
                    padding: '2px 10px',
                  }}
                >
                  {activity.scope}
                </span>
              </td>
              <td>
                {getLabel(activity.task, activity.scope)}
                {activity.scope === 'adspl' && activity.adsplId && (
                  <Link url={'/adspl?id=' + activity.adsplId}>{activity.adsplId}</Link>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
