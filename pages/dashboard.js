import React, { useState } from 'react';
import Title from '../components/atoms/Title';
import Layout from '../components/organismes/Layout';
import TableTickets from '../components/molecules/TableTickets';
import useLoadable from '../utils/use-loadable';

const ALL = 'ALL';
const WAITING = 'WAITING';
const MINE = 'MINE';

const LIMIT = 10;

function AllTickets({ Tickets, visible }) {
  if (!visible) return null;
  const { data, fetchMore } = useLoadable(Tickets, { limit: LIMIT });
  return (
    <div>
      <TableTickets tickets={data} />
      <button onClick={fetchMore}>MORE</button>
    </div>
  );
}

function WaitingTickets({ Tickets, visible }) {
  const { data } = useLoadable(Tickets, { status: 'PENDING' });
  if (!visible) return null;
  return <TableTickets tickets={data} />;
}

function MyTickets({ Tickets, user, visible }) {
  const { data } = useLoadable(Tickets, { followedBy: user, status: 'IN_PROGRESS' });
  if (!visible) return null;
  return <TableTickets tickets={data} />;
}

function TicketsView({ Tickets, user }) {
  const [filter, setFilter] = useState(MINE);

  return (
    <React.Fragment>
      <div>
        <button onClick={() => setFilter(MINE)}>MINE</button>
        <button onClick={() => setFilter(WAITING)}>WAITING</button>
        <button onClick={() => setFilter(ALL)}>ALL</button>
      </div>
      <AllTickets Tickets={Tickets} visible={filter === ALL} />
      <WaitingTickets Tickets={Tickets} visible={filter === WAITING} />
      <MyTickets Tickets={Tickets} user={user} visible={filter === MINE} />
    </React.Fragment>
  );
}

export default function Dashboard({ Tickets, user }) {
  return (
    <Layout>
      <Title type="primary">My Tickets</Title>
      <TicketsView Tickets={Tickets} user={user} />
    </Layout>
  );
}
