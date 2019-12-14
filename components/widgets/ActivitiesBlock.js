import React, { useContext, useEffect, useState } from 'react';
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

function getLabel(activity, scope) {
  if (scope === 'adspl') {
    switch (activity.task) {
      case 'infos-update':
        return 'Mise à jour des informations du siret: ';
      case 'check-entry':
        return 'Saisie de chèque pour ';
      case 'delete-account':
        return 'Suppression du compte: ' + activity.input.email;
      default:
        return activity.task;
    }
  }
  if (scope === 'crm') {
    switch (activity.event.type) {
      case 'create-ticket':
        return 'Création du ticket ';
      case 'add-follower':
        return "Assignation d'un agent sur le ticket ";
      case 'remove-follower':
        return "Dé-assignation d'un agent sur le ticket ";
      case 'update-title':
        return 'Mise à jour du titre du ticket ';
      case 'update-description':
        return 'Mise à jour de la description du ticket ';
      case 'add-comment':
        return "Ajout d'un commentaire sur le ticket ";
      case 'close-ticket':
        return 'Fermeture du ticket ';
      case 'reopen-ticket':
        return 'Ré-ouverture du ticket ';
      case 'update-isActive':
        return "Mise à jour de l'état du compte de ";
      case 'update-groups':
        return 'Mise à jour des groupes de compte de ';
      default:
        return activity.event.type;
    }
  }
  return '';
}

function Details({ activity }) {
  const [displayDetails, setDisplayDetails] = useState(false);
  return (
    <React.Fragment>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div>
          {getLabel(activity, activity.scope)}
          {activity.scope === 'adspl' && activity.adsplId && (
            <Link url={'/adspl?id=' + activity.adsplId}>{activity.adsplId}</Link>
          )}
          {activity.scope === 'crm' && activity.ticketId && (
            <Link url={'/tickets/' + activity.ticketId}>{activity.ticketId}</Link>
          )}
          {activity.scope === 'crm' && activity.userId && (
            <Link url={'/users/' + activity.userId}>{activity.userId}</Link>
          )}
        </div>
        <button onClick={() => setDisplayDetails(!displayDetails)}>
          {displayDetails ? 'Masquer le détails' : 'Afficher le détails'}
        </button>
      </div>
      {displayDetails && <pre>{JSON.stringify(activity, null, 2)}</pre>}
    </React.Fragment>
  );
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
        <span style={{ margin: '0 1rem' }}>{moment(date, 'DD_MM_YYYY').format('DD/MM/YYYY')}</span>
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
          {current.context.activities.map((activity, i) => (
            <tr key={i}>
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
                  {moment(activity.date || activity.event.on).format('HH:mm:ss')}
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
                <Details activity={activity} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <style jsx>{`
        table {
          width: 100%;
        }
        td {
          vertical-align: baseline;
        }
      `}</style>
    </div>
  );
}
