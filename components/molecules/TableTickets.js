import Link from '../atoms/Link';
import StatusChip from '../atoms/StatusChip';
import colors from '../../styles/colors';

const TicketLink = ({ ticket }) => (
  <tr>
    <td style={{ textAlign: 'left' }}>
      <StatusChip status={ticket.status} />
    </td>
    <td>
      <Link as={`/t/${ticket.id}`} url={`/ticket?title=${ticket.title}`}>
        {ticket.title}
      </Link>
    </td>
    <td>{ticket.author}</td>
    <style jsx>{`
      tr:hover {
        background-color: ${colors.SKY_LIGHT};
      }
      td {
        padding: 14px 40px 14px 16px;
        font-size: 0.875rem;
        text-align: left;
        font-family: Helvetica, Arial;
        font-weight: 400;
        text-align: right;
        border-bottom: 1px solid ${colors.GRAY_LIGHT};
        letter-spacing: 0.01071em;
      }
    `}</style>
  </tr>
);

export default function TableTickets({ tickets }) {
  return (
    <div>
      <table>
        <thead>
          <tr>
            <th style={{ textAlign: 'left', width: '7rem' }}>Statut</th>
            <th>Ticket</th>
            <th>Auteur</th>
          </tr>
        </thead>
        <tbody>
          {tickets.map(ticket => (
            <TicketLink key={ticket.id} ticket={ticket} />
          ))}
        </tbody>
      </table>
      <style jsx>{`
        div {
          border-radius: 4px;
          box-shadow: 0px 1px 3px 0px rgba(0, 0, 0, 0.2), 0px 1px 1px 0px rgba(0, 0, 0, 0.14),
            0px 2px 1px -1px rgba(0, 0, 0, 0.12);
          transition: box-shadow 300ms cubic-bezier(0.4, 0, 0.2, 1) 0ms;
          overflow-x: auto;
        }
        table {
          width: 100%;
          border-spacing: 0;
          border-collapse: collapse;
        }
        th {
          padding: 14px 40px 14px 16px;
          color: ${colors.WHITE};
          background-color: ${colors.SKY_DARK};
          text-align: right;
          font-family: Helvetica, Arial;
          font-size: 0.9rem;
        }
      `}</style>
    </div>
  );
}
