import { useEffect, useContext, createRef } from 'react';
import moment from 'moment';
import marked from 'marked';
import DOMPurify from 'dompurify';

import Title from '../../components/atoms/Title';
import Layout from '../../components/organismes/Layout';
import UserContext from '../../utils/UserContext';
import { assign, Machine } from 'xstate';
import { useMachine } from '@xstate/react';
import colors from '../../styles/colors';
import { EmailBlock } from '../../components/widgets/EmailBlock';
import DomainsContext from '../../utils/DomainsContext';

const machine = Machine(
  {
    id: 'ticket',
    initial: 'idle',
    context: {
      ticket: null,
      error: null,
    },
    states: {
      idle: {
        on: {
          FETCH_TICKET: {
            target: 'fetchingTicket',
            cond: 'validId',
          },
        },
      },
      fetchingTicket: {
        invoke: {
          src: 'fetchTicket',
          onDone: {
            target: 'ticketReady',
            actions: ['updateTicket'],
          },
          onError: {
            target: 'fetchingTicketFailure',
            actions: ['updateError'],
          },
        },
      },
      ticketReady: {
        on: {
          FOLLOW_TICKET: 'followingTicket',
          UNFOLLOW_TICKET: 'unfollowingTicket',
          UPDATE_TITLE: 'updatingTitle',
          UPDATE_DESCRIPTION: 'updatingDescription',
          ADD_COMMENT: 'addingComment',
          UPDATE_COMMENT: 'updatingComment',
          CLOSE_TICKET: 'closeTicket',
          REOPEN_TICKET: 'reopeningTicket',
        },
      },
      fetchingTicketFailure: {
        on: {
          RETRY: 'fetchingTicket',
        },
      },
      addingComment: {
        invoke: {
          src: 'addComment',
          onDone: {
            target: 'ticketReady',
            actions: ['updateTicket'],
          },
          onError: {
            target: 'addingCommentFailure',
            actions: ['updateError'],
          },
        },
      },
      addingCommentFailure: {
        on: {
          RETRY: 'addingComment',
        },
      },
      closeTicket: {
        invoke: {
          src: 'closeTicket',
          onDone: {
            target: 'ticketReady',
            actions: ['updateTicket'],
          },
          onError: {
            target: 'closeTicketFailure',
            actions: ['updateError'],
          },
        },
      },
      closeTicketFailure: {
        on: {
          RETRY: 'addingComment',
        },
      },
      reopeningTicket: {
        invoke: {
          src: 'reopenTicket',
          onDone: {
            target: 'ticketReady',
            actions: ['updateTicket'],
          },
          onError: {
            target: 'reopeningTicketFailure',
            actions: ['updateError'],
          },
        },
      },
      reopeningTicketFailure: {
        on: {
          RETRY: 'addingComment',
        },
      },
      followingTicket: {
        invoke: {
          src: 'addFollower',
          onDone: {
            target: 'ticketReady',
            actions: ['updateTicket'],
          },
          onError: {
            target: 'followingTicketFailure',
            actions: ['updateError'],
          },
        },
      },
      followingTicketFailure: {
        on: {
          RETRY: 'followingTicket',
        },
      },
      unfollowingTicket: {
        invoke: {
          src: 'removeFollower',
          onDone: {
            target: 'ticketReady',
            actions: ['updateTicket'],
          },
          onError: {
            target: 'unfollowingTicketFailure',
            actions: ['updateError'],
          },
        },
      },
      unfollowingTicketFailure: {
        on: {
          RETRY: 'unfollowingTicket',
        },
      },
      updatingTitle: {
        invoke: {
          src: 'updateTitle',
          onDone: {
            target: 'ticketReady',
            actions: ['updateTicket'],
          },
          onError: {
            target: 'updatingTitleFailure',
            actions: ['updateError'],
          },
        },
      },
      updatingTitleFailure: {
        on: {
          RETRY: 'updatingTitle',
        },
      },
      updatingDescription: {
        invoke: {
          src: 'updateDescription',
          onDone: {
            target: 'ticketReady',
            actions: ['updateTicket'],
          },
          onError: {
            target: 'updatingDescriptionFailure',
            actions: ['updateError'],
          },
        },
      },
      updatingDescriptionFailure: {
        on: {
          RETRY: 'updatingDescription',
        },
      },
      updatingComment: {
        invoke: {
          src: 'updateComment',
          onDone: {
            target: 'ticketReady',
            actions: ['updateTicket'],
          },
          onError: {
            target: 'updatingCommentFailure',
            actions: ['updateError'],
          },
        },
      },
      updatingCommentFailure: {
        on: {
          RETRY: 'updatingComment',
        },
      },
    },
  },
  {
    actions: {
      updateTicket: assign({
        ticket: (_, event) => event.data,
      }),
      updateError: assign({
        error: (_, event) => event.data,
      }),
    },
  },
);

const editableMachine = Machine({
  id: 'editableMachine',
  initial: 'idle',
  states: {
    idle: {
      on: { EDIT: 'editing' },
    },
    editing: {
      on: {
        SAVE: {
          target: 'idle',
          actions: ['save'],
        },
        CANCEL: 'idle',
      },
    },
  },
});

const Markdown = ({ text }) => <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(marked(text)) }} />;

const TitleBlock = ({ title, onChange }) => {
  const inputRef = createRef();
  const [current, send] = useMachine(editableMachine, {
    actions: {
      save: (_, event) => onChange(event.value),
    },
  });
  if (current.value === 'editing') {
    return (
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <input ref={inputRef} type="text" defaultValue={title} style={{ width: '100%' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <button onClick={() => send({ type: 'SAVE', value: inputRef.current.value })}>Enregistrer</button>
          <button onClick={() => send('CANCEL')}>Annuler</button>
        </div>
      </div>
    );
  }
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
      <Title type="primary" trunc>
        {title || 'Title'}
      </Title>
      <div>
        <button onClick={() => send('EDIT')}>Modifier</button>
      </div>
    </div>
  );
};

const DescriptionBlock = ({ description, onChange }) => {
  const textRef = createRef();
  const [current, send] = useMachine(editableMachine, {
    actions: {
      save: (_, event) => onChange(event.value),
    },
  });
  if (current.value === 'editing') {
    return (
      <React.Fragment>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2>Description</h2>
          <div>
            <button onClick={() => send({ type: 'SAVE', value: textRef.current.value })}>Enregistrer</button>
            <button onClick={() => send('CANCEL')}>Annuler</button>
          </div>
        </div>
        <textarea ref={textRef} type="text" defaultValue={description} rows={7} style={{ width: '100%' }} />
      </React.Fragment>
    );
  }
  return (
    <React.Fragment>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Description</h2>
        <div>
          <button onClick={() => send('EDIT')}>Modifier</button>
        </div>
      </div>
      <Markdown text={description} />
    </React.Fragment>
  );
};

const CommentBlock = ({ comment, onChange, getUserName }) => {
  const inputRef = createRef();
  const [current, send] = useMachine(editableMachine, {
    actions: {
      save: (_, event) => onChange({ comment, newText: event.value }),
    },
  });

  return (
    <div
      style={{
        border: '1px solid ' + colors.SKY_DARK,
        padding: '1rem',
        borderRadius: '5px',
        marginBottom: '1rem',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
        }}
      >
        <div>Le {moment(comment.createAt).format('DD/MM/YYYY HH:mm:ss')}</div>
        <div>Par {getUserName(comment.by)}</div>
        {current.value === 'editing' ? (
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <button onClick={() => send({ type: 'SAVE', value: inputRef.current.value })}>Enregistrer</button>
            <button onClick={() => send('CANCEL')}>Annuler</button>
          </div>
        ) : (
          <button onClick={() => send('EDIT')}>Modifier</button>
        )}
      </div>
      {current.value === 'editing' ? (
        <textarea ref={inputRef} defaultValue={comment.text} style={{ width: '100%' }} rows={7} />
      ) : (
        <Markdown text={comment.text} />
      )}
    </div>
  );
};

const Ticket = props => {
  const { Tickets, Users } = useContext(DomainsContext);
  const { ticketId } = props;
  const user = useContext(UserContext);
  const [current, send] = useMachine(machine, {
    services: {
      fetchTicket: (_, event) => {
        return Promise.all([Users.prefetchNames(), Tickets.fetchTicket(event.ticketId)]).then(([_, ticket]) => ticket);
      },
      addFollower: context => Tickets.addFollower(context.ticket, user),
      removeFollower: context => Tickets.removeFollower(context.ticket, user),
      addComment: (context, event) => Tickets.addComment({ ticket: context.ticket, comment: event.comment }, user),
      updateComment: (context, event) => {
        console.log('event', event);
        return Tickets.updateComment({ ticket: context.ticket, ...event.value }, user);
      },
      closeTicket: (context, event) => Tickets.closeTicket({ ticket: context.ticket, comment: event.comment }, user),
      reopenTicket: (context, event) => Tickets.reopenTicket({ ticket: context.ticket, comment: event.comment }, user),
      updateTitle: (context, event) => Tickets.updateTitle({ ticket: context.ticket, value: event.value }, user),
      updateDescription: (context, event) =>
        Tickets.updateDescription({ ticket: context.ticket, value: event.value }, user),
    },
    guards: {
      validId: (_, event) => Boolean(event.ticketId),
    },
  });

  useEffect(() => {
    send({ type: 'FETCH_TICKET', ticketId });
  }, [ticketId]);

  const ticket = current.context.ticket;
  if (!ticket) {
    console.error('No ticket!', ticketId);
    return null;
  }
  console.log('ticket', ticket);
  const { author, status, title, followers, description, comments = [], emailId } = ticket;

  const commentRef = createRef();
  return (
    <Layout>
      <TitleBlock title={title} onChange={value => send({ type: 'UPDATE_TITLE', value })} />
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          border: '1px solid ' + colors.SKY_DARK,
          padding: '1rem',
          borderRadius: '5px',
        }}
      >
        <div>
          <p>Ticket #{ticketId || 'ID'}</p>

          <p>Auteur: {author}</p>
          <p>Statut: {status}</p>
        </div>
        <div>
          {Tickets.followedBy(ticket, user) ? (
            <button onClick={() => send({ type: 'UNFOLLOW_TICKET' })}>Ignorer cette demande</button>
          ) : (
            <button onClick={() => send({ type: 'FOLLOW_TICKET' })}>Suivre cette demande</button>
          )}
          <p>
            Suivi par:{' '}
            {followers.length === 0
              ? '-'
              : followers.map(uid => (user.id === uid ? 'Moi' : Users.getFullname(uid))).join(',')}
          </p>
        </div>
      </div>
      {description && (
        <DescriptionBlock description={description} onChange={value => send({ type: 'UPDATE_DESCRIPTION', value })} />
      )}
      {emailId && (
        <EmailBlock
          emailId={emailId}
          onResponse={responseText => send({ type: 'ADD_COMMENT', comment: 'Réponse envoyée: ' + responseText })}
        />
      )}

      <h2>Suivi</h2>
      {comments.map(comment => (
        <CommentBlock
          key={comment.createAt}
          comment={comment}
          getUserName={Users.getFullname}
          onChange={value => send({ type: 'UPDATE_COMMENT', value })}
        />
      ))}

      <div>
        <textarea rows={7} ref={commentRef}></textarea>
        {status === 'CLOSED' ? (
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button
              onClick={() => {
                send({
                  type: 'REOPEN_TICKET',
                  comment: commentRef.current.value,
                });
                commentRef.current.value = '';
              }}
            >
              Ré-ouvrir le ticket
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button
              onClick={() => {
                send({
                  type: 'CLOSE_TICKET',
                  comment: commentRef.current.value,
                });
                commentRef.current.value = '';
              }}
            >
              Fermer le ticket
            </button>
            <button
              onClick={() => {
                if (commentRef.current && commentRef.current.value) {
                  send({
                    type: 'ADD_COMMENT',
                    comment: commentRef.current.value,
                  });
                  commentRef.current.value = '';
                }
              }}
            >
              Ajouter un commentaire
            </button>
          </div>
        )}

        <style jsx>{`
          textarea {
            width: 100%;
          }
        `}</style>
      </div>
    </Layout>
  );
};

Ticket.getInitialProps = async function(context) {
  const { id } = context.query;
  return { ticketId: id };
};

export default Ticket;
