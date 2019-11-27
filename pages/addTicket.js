import { createRef, useContext } from 'react';
import Router from 'next/router';

import Layout from '../components/organismes/Layout';
import Link from '../components/atoms/Link';
import UserContext from '../utils/UserContext';
import DomainsContext from '../utils/DomainsContext';

export default function AddTicket() {
  const { Tickets } = useContext(DomainsContext);
  const titleRef = createRef();
  const descRef = createRef();
  const user = useContext(UserContext);
  return (
    <Layout>
      <h1>Nouveau ticket</h1>

      <h2>Description</h2>
      <input ref={titleRef} type="text" />
      <textarea ref={descRef} style={{ width: '100%' }} rows="10"></textarea>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <Link url="/">Retour</Link>
        <button
          onClick={() => {
            Tickets.addTicket(
              {
                title: titleRef.current.value,
                description: descRef.current.value,
              },
              user,
            ).then(() => {
              Router.push('/');
            });
          }}
        >
          Add
        </button>
      </div>
    </Layout>
  );
}
