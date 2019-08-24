import { useEffect, useContext } from 'react';
import Title from '../components/atoms/Title';
import Layout from '../components/organismes/Layout';
import UserContext from '../utils/UserContext';
import { assign, Machine } from 'xstate';
import { useMachine } from '@xstate/react';

const machine = Machine({
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
          target: 'loading',
          cond: 'validId',
        },
      },
    },
    loading: {
      invoke: {
        src: 'fetchTicket',
        onDone: {
          target: 'success',
          actions: assign({
            ticket: (_, event) => event.data,
            error: () => null,
          }),
        },
        onError: {
          target: 'failure',
          actions: assign({
            error: (_, event) => event.data,
            ticket: () => null,
          }),
        },
      },
    },
    success: {
      on: {
        UPDATE_TICKET: {
          actions: assign({
            ticket: (_, event) => event.ticket,
          }),
        },
      },
    },
    failure: {
      on: {
        RETRY: 'loading',
      },
    },
  },
});

const Ticket = props => {
  const { ticketId, Tickets, Users } = props;
  const user = useContext(UserContext);
  const [current, send] = useMachine(machine, {
    services: {
      fetchTicket: (_, event) => Tickets.fetchTicket(event.ticketId),
    },
    guards: {
      validId: (_, event) => Boolean(event.ticketId),
    },
  });

  console.log('ticketId', ticketId, current);
  useEffect(() => {
    send({ type: 'FETCH_TICKET', ticketId });
  }, [ticketId]);

  const ticket = current.context.ticket;

  if (!ticket) return null;

  const { author, status, title, followers } = ticket;

  return (
    <Layout>
      <Title type="primary">{title || 'Title'}</Title>
      <p>Ticket #{ticketId || 'ID'}</p>

      <p>Author: {author}</p>
      <p>Status: {status}</p>
      <p>
        Followers:{' '}
        {followers.length === 0
          ? 'No followers'
          : followers.map(uid => (user.id === uid ? 'Me' : Users.getFullname(uid))).join(',')}
      </p>
      {Tickets.followedBy(ticket, user) ? (
        <button
          onClick={() => Tickets.removeFollower(ticket, user).then(ticket => send({ type: 'UPDATE_TICKET', ticket }))}
        >
          Unfollow this issue
        </button>
      ) : (
        <button
          onClick={() => Tickets.addFollower(ticket, user).then(ticket => send({ type: 'UPDATE_TICKET', ticket }))}
        >
          Follow this issue
        </button>
      )}
    </Layout>
  );
};

Ticket.getInitialProps = async function(context) {
  const { id } = context.query;
  return { ticketId: id };
};

export default Ticket;
