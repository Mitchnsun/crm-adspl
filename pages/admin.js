import { useContext } from 'react';
import Layout from '../components/organismes/Layout';
import SessionContext from '../utils/SessionContext';
import useObservable from '../utils/use-observable';

function Users() {
  const session = useContext(SessionContext);
  if (!session.isUserAdmin()) return null;

  const admin = session.getCurrentUser();
  const { data } = useObservable(admin.users.getObservable(), admin.users.fetch, []);

  const grouped = admin.users.groupByStatus((data || []).filter(u => u.id !== admin.uid));

  return (
    <div>
      <h2>Users</h2>
      <h3>Actives</h3>
      {grouped.actives.map(user => {
        return (
          <div key={user.id}>
            <span>
              {user.firstname} {user.lastname} {user.isActive}{' '}
            </span>
            <button onClick={() => admin.users.disable(user)}>Inactive</button>
          </div>
        );
      })}

      <h3>Inactives</h3>
      {grouped.inactives.map(user => {
        return (
          <div key={user.id}>
            <span>
              {user.firstname} {user.lastname} {user.isActive}{' '}
            </span>
            <button onClick={() => admin.users.enable(user)}>Active</button>
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
      <Users />
    </Layout>
  );
}
