import Title from '../frameworks/Title';
import Layout from '../components/Layout';
import TableTickets from '../components/TableTickets';
import usePromise from '../utils/use-promise';

export default function Dashboard({ user }) {
  const { data } = usePromise(user.tickets.getAll(), []);

  return (
    <Layout>
      <Title type="primary">My Tickets</Title>
      <TableTickets tickets={data} />
    </Layout>
  );
}
