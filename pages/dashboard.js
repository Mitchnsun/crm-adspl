import Title from '../frameworks/Title';
import Layout from '../components/Layout';
import TableTickets from '../components/TableTickets';

function getTickets() {
  return [
    { id: 1, title: 'SIREN perdu', status: 'RESOLVED', author: 'Matthieu Compérat' },
    { id: 2, title: 'Mot de passe erroné', status: 'IN_PROGRESS', author: 'Grégory Magallon' },
    { id: 3, title: 'Email oublié', status: 'PENDING', author: 'Enguerran Brembilla' },
  ];
}

export default function Dashboard() {
  return (
    <Layout>
      <Title type="primary">My Tickets</Title>
      <TableTickets tickets={getTickets()} />
    </Layout>
  );
}
