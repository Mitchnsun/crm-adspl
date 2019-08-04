import { useState } from 'react';
import Title from '../components/atoms/Title';
import Layout from '../components/organismes/Layout';

const Ticket = props => {
  const { id, user, Tickets, Users } = props;
  const [ticket, setTicket] = useState(props.ticket);
  const { author, status, title, followers } = ticket;
  return (
    <Layout>
      <Title type="primary">{title || 'Title'}</Title>
      <p>Ticket #{id || 'ID'}</p>

      <p>Author: {author}</p>
      <p>Status: {status}</p>
      <p>
        Followers:{' '}
        {followers.length === 0
          ? 'No followers'
          : followers.map(uid => (user.id === uid ? 'Me' : Users.getFullname(uid))).join(',')}
      </p>
      {Tickets.followedBy(ticket, user) ? (
        <button onClick={() => Tickets.removeFollower(ticket, user).then(setTicket)}>Unfollow this issue</button>
      ) : (
        <button onClick={() => Tickets.addFollower(ticket, user).then(setTicket)}>Follow this issue</button>
      )}
    </Layout>
  );
};

Ticket.getInitialProps = async function(context, { Tickets }) {
  const { id } = context.query;
  const ticket = await Tickets.fetchTicket(id);
  return { id, ticket };
};

export default Ticket;
