import { useContext } from 'react';
import Layout from '../components/organismes/Layout';
import SessionContext from '../utils/SessionContext';
import useObservable from '../utils/use-observable';

function Agents() {
  const session = useContext(SessionContext);
  if (!session.isUserAdmin) return null;

  const user = session.getCurrentUser();
  const { data } = useObservable(user.agents.getObservable(), user.agents.fetch);

  const grouped = user.agents.groupByStatus(data);

  return (
    <div>
      <h2>Agents</h2>
      <h3>Actives</h3>
      {grouped.actives.map(agent => {
        return (
          <div key={agent.id}>
            <span>
              {agent.firstname} {agent.lastname} {agent.isActive}{' '}
            </span>
            <button onClick={() => (agent.isActive ? user.agents.disable(agent) : user.agents.enable(agent))}>
              {agent.isActive ? 'Inactive' : 'Active'}
            </button>
          </div>
        );
      })}

      <h3>Inactives</h3>
      {grouped.inactives.map(agent => {
        return (
          <div key={agent.id}>
            <span>
              {agent.firstname} {agent.lastname} {agent.isActive}{' '}
            </span>
            <button onClick={() => (agent.isActive ? user.agents.disable(agent) : user.agents.enable(agent))}>
              {agent.isActive ? 'Inactive' : 'Active'}
            </button>
          </div>
        );
      })}
    </div>
  );
}

export default function admin() {
  return (
    <Layout>
      <h1>Admin</h1>
      <Agents />
    </Layout>
  );
}
