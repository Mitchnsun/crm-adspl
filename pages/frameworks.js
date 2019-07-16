import Layout from '../components/Layout';
import Title from '../frameworks/Title';
import StatusChip from '../frameworks/StatusChip';
import Link from '../frameworks/Link';
import TableTickets from '../components/TableTickets';

const CHIP_STATUS = ['PENDING', 'IN_PROGRESS', 'BLOCKED', 'RESOLVED', 'CLOSED', 'NO_STATUS'];
const TICKETS = [
  { id: 1, title: 'SIREN perdu', status: 'RESOLVED', author: 'Matthieu Compérat' },
  { id: 2, title: 'Mot de passe erroné', status: 'IN_PROGRESS', author: 'Grégory Magallon' },
  { id: 3, title: 'Email oublié', status: 'PENDING', author: 'Enguerran Brembilla' },
];

const divStyle = {
  marginTop: 10,
};

export default function Frameworks() {
  return (
    <Layout>
      <Title type="primary">This is the frameworks page</Title>
      <Title type="secondary">Tickets</Title>
      <TableTickets tickets={TICKETS} />
      <br />
      <Title type="subtitle">Component StatusChip</Title>
      <div style={divStyle}>
        {CHIP_STATUS.map(status => (
          <StatusChip status={status} />
        ))}
      </div>
      <br />
      <Link url="/dashboard">Retour au dashboard</Link>
    </Layout>
  );
}
