import Title from '../frameworks/Title';
import Link from '../frameworks/Link';
import Layout from '../components/Layout.js';

function getTickets() {
  return [
    { id: 1, title: 'Ticket 1: SIREN perdu' },
    { id: 2, title: 'Ticket 2: Mot de passe erroné' },
    { id: 3, title: 'Ticket 3: Email' },
  ];
}

const TicketLink = ({ ticket }) => (
  <li>
    <Link as={`/t/${ticket.id}`} url={`/ticket?title=${ticket.title}`}>
      {ticket.title}
    </Link>
    <style jsx>{`
      li {
        list-style: none;
        margin: 5px 0;
      }
    `}</style>
  </li>
);

export default function Dashboard() {
  return (
    <Layout>
      <Title type="primary">My Tickets</Title>
      <ul>
        {getTickets().map(ticket => (
          <TicketLink key={ticket.id} ticket={ticket} />
        ))}
      </ul>
      <style jsx>{`
        a {
          font-family: 'Arial';
        }

        ul {
          padding: 0;
        }

        li {
          list-style: none;
          margin: 5px 0;
        }

        a {
          text-decoration: none;
          color: blue;
        }

        a:hover {
          opacity: 0.6;
        }
      `}</style>
    </Layout>
  );
}
