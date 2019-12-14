import { createRef, useContext, useState } from 'react';
import Router from 'next/router';

import colors from '../styles/colors';
import Layout from '../components/organismes/Layout';
import Link from '../components/atoms/Link';
import UserContext from '../utils/UserContext';
import DomainsContext from '../utils/DomainsContext';

export default function AddTicket() {
  const { Tickets } = useContext(DomainsContext);
  const titleRef = createRef();
  const descRef = createRef();
  const adsplRef = createRef();
  const user = useContext(UserContext);
  const [scope, setScope] = useState('adspl');

  return (
    <Layout>
      <h1>Nouveau ticket</h1>

      <div className="type">
        <h3>Type</h3>
        {['adspl', 'crm'].map(scp => (
          <span>
            <input checked={scope === scp} name="scope" onChange={() => setScope(scp)} type="radio" /> {scp}
          </span>
        ))}
      </div>

      {scope === 'adspl' && (
        <div className="adsplId">
          <h3>Siret / Siren</h3>
          <div>
            <input ref={adsplRef} type="text" className="box" />
          </div>
        </div>
      )}

      <div className="title">
        <h3>Titre</h3>
        <div>
          <input ref={titleRef} type="text" className="box" />
        </div>
      </div>

      <div className="description">
        <h3>Description</h3>
        <div>
          <textarea ref={descRef} rows="10" className="box"></textarea>
        </div>
      </div>

      <div className="actions">
        <Link url="/">Retour</Link>
        <button
          onClick={() => {
            if (titleRef.current.value && descRef.current.value) {
              if (scope !== 'adspl' || adsplRef.current.value)
                Tickets.addTicket(
                  {
                    title: titleRef.current.value,
                    description: descRef.current.value,
                    adsplId: adsplRef.current.value,
                    scope,
                  },
                  user,
                ).then(() => {
                  Router.push('/');
                });
            }
          }}
        >
          Ajouter
        </button>
      </div>
      <style jsx>{`
        .type span {
          margin-right: 1em;
        }
        .box {
          box-sizing: border-box;
        }
        .title input,
        .adsplId input,
        .description textarea {
          width: 100%;
          border: 1px solid ${colors.SKY_DARK};
          border-radius: 5px;
          padding: 5px;
        }
        .actions {
          display: flex;
          justify-content: space-between;
        }

        button {
          color: white;
          background-color: ${colors.SKY_DARK};
          border: 1px solid ${colors.SKY_DARK};
          border-radius: 5px;
          padding: 5px;
          cursor: pointer;
        }
      `}</style>
    </Layout>
  );
}
