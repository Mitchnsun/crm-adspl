import Title from '../components/atoms/Title';
import Layout from '../components/organismes/Layout';
import TableTickets from '../components/molecules/TableTickets';
import usePromise from '../utils/use-promise';

export default function Dashboard({ user }) {
  if (!user) return null;
  const { data } = usePromise(user.tickets.getAll(), []);

  return (
    <Layout>
      <Title type="primary">My Tickets</Title>
      <TableTickets tickets={data} />
    </Layout>
  );
}
