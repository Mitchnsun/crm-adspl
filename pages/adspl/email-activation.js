import { useContext, createRef, useState } from 'react';
import Layout from '../../components/organismes/Layout';
import { AdsplMenu } from '../../components/molecules/AdsplMenu';
import DomainsContext from '../../utils/DomainsContext';
import UserContext from '../../utils/UserContext';

export default function emailActivation() {
  const { Adspl } = useContext(DomainsContext);
  const user = useContext(UserContext);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const idRef = createRef();
  const emailRef = createRef();

  return (
    <Layout>
      <AdsplMenu />

      <br />
      <table>
        <tbody>
          <tr>
            <td>Siret/Siren</td>
            <td>
              <input ref={idRef} type="text" />
            </td>
          </tr>
          <tr>
            <td>Email</td>
            <td>
              <input ref={emailRef} type="text" />
            </td>
          </tr>
        </tbody>
      </table>
      <br />

      <button
        disabled={loading}
        onClick={() => {
          setLoading(true);
          const id = idRef.current.value;
          const email = emailRef.current.value;
          Adspl.activateEmail(id, email, user)
            .then(() => {
              setLoading(false);
              setError(false);
            })
            .catch(() => {
              setLoading(false);
              setError(true);
            });
        }}
      >
        Activer l'email
      </button>
      {loading && <label>En cours...</label>}
      {error && <label>Une erreur est survenue</label>}
      <style jsx>{`
        input {
          margin-left: 0.5em;
        }
      `}</style>
    </Layout>
  );
}
