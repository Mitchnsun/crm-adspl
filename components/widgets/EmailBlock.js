import { useContext, useEffect, createRef } from 'react';
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
      on: {
        SEND_EMAIL: 'sendingEmail',
      },
    },
    failure: {
      on: {
        RETRY: 'loading',
      },
    },
    sendingEmail: {
      invoke: {
        src: 'sendEmail',
        onDone: {
          target: 'success',
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

const Answer = ({ answer }) => {
  const ref = createRef();
  return (
    <div>
      <textarea row={4} style={{ width: '100%' }} ref={ref}></textarea>
      <button
        onClick={() => {
          answer(ref.current.value);
          ref.current.value = '';
        }}
      >
        Répondre
      </button>
    </div>
  );
};

const extractEmail = text => (/<(.*)>/.test(text) ? /<(.*)>/.exec(text)[1] : text);

export function EmailBlock({ emailId, onResponse }) {
  const user = useContext(UserContext);
  const domains = useContext(DomainsContext);

  if (!user || !domains) throw new Error('UserContext and DomainsContext must be initialized.');

  const [current, send] = useMachine(machine, {
    services: {
      fetchEmail: () => domains.Emails.getById(emailId, user),
      sendEmail: (_, { body }) => domains.Emails.sendEmail(body, user).then(() => onResponse(body.message)),
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
          <Answer
            answer={message => {
              const fromValue = current.context.email.data.payload.headers.find(h => h.name.toLowerCase() === 'from')
                .value;
              const toValue = current.context.email.data.payload.headers.find(h => h.name.toLowerCase() === 'to').value;
              send({
                type: 'SEND_EMAIL',
                body: {
                  message,
                  subject: "Réponse de l'ADSPL",
                  to: {
                    email: extractEmail(fromValue),
                  },
                  from: {
                    email: extractEmail(toValue),
                  },
                },
              });
            }}
          />
        </div>
      );
    } catch (e) {
      console.error(e);
      return null;
    }
  }

  return <p>Chargement de l'email...</p>;
}
