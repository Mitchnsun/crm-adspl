import Layout from '../components/Layout.js';
import Link from 'next/link';

function getTickets() {
  return [
    { id: 1, title: 'Ticket 1: SIREN perdu' },
    { id: 2, title: 'Ticket 2: Mot de passe erroné' },
    { id: 3, title: 'Ticket 3: Email' },
  ];
}

const TicketLink = ({ ticket }) => (
  <li>
    <Link as={`/t/${ticket.id}`} href={`/ticket?title=${ticket.title}`}>
      <a>{ticket.title}</a>
    </Link>
    <style jsx>{`
      li {
        list-style: none;
        margin: 5px 0;
      }

      a {
        text-decoration: none;
        color: blue;
        font-family: 'Arial';
      }

      a:hover {
        opacity: 0.6;
      }
    `}</style>
  </li>
);

export default function Dashboard() {
  return (
    <Layout>
      <h1>My Tickets</h1>
      <ul>
        {getTickets().map(ticket => (
          <TicketLink key={ticket.id} ticket={ticket} />
        ))}
      </ul>
      <style jsx>{`
        h1,
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
