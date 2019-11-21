import { useContext, useEffect } from 'react';
import { assign, Machine } from 'xstate';
import { useMachine } from '@xstate/react';
import UserContext from '../../utils/UserContext';
import DomainsContext from '../../utils/DomainsContext';

const machine = Machine({
  id: 'email',
  initial: 'idle',
  context: {
    email: null,
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
        src: 'fetchEmail',
        onDone: {
          target: 'success',
          actions: assign({
            email: (_, event) => event.data,
            error: () => null,
          }),
        },
        onError: {
          target: 'failure',
          actions: assign({
            error: (_, event) => event.data,
            email: () => null,
          }),
        },
      },
    },
    success: {
      final: true,
    },
    failure: {
      on: {
        RETRY: 'loading',
      },
    },
  },
});

const Answer = () => {
  return (
    <div>
      <textarea row={4} style={{ width: '100%' }}></textarea>
      <button>Répondre</button>
    </div>
  );
};

export function EmailBlock({ emailId }) {
  const user = useContext(UserContext);
  const domains = useContext(DomainsContext);

  if (!user || !domains) throw new Error('UserContext and DomainsContext must be initialized.');

  const [current, send] = useMachine(machine, {
    services: {
      fetchEmail: () => domains.Emails.getById(emailId, user),
    },
  });

  useEffect(() => {
    send('FETCH');
  }, []);

  console.log('emailBlock', current);

  if (current.context.email) {
    try {
      return (
        <div>
          <h2>Email reçu</h2>
          <div
            style={{ pointerEvents: 'none' }}
            dangerouslySetInnerHTML={{
              __html: decodeURIComponent(
                escape(
                  atob(
                    current.context.email.data.payload.parts
                      .find(p => p.mimeType === 'text/html')
                      .body.data.replace(/-/g, '+')
                      .replace(/_/g, '/'),
                  ),
                ),
              ),
            }}
          />
          <br />
          <Answer />
        </div>
      );
    } catch (e) {
      console.error(e);
      return null;
    }
  }

  return <p>Chargement de l'email...</p>;
}
