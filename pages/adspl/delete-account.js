import { useContext, createRef, useState } from 'react';
import Layout from '../../components/organismes/Layout';
import { AdsplMenu } from '../../components/molecules/AdsplMenu';
import DomainsContext from '../../utils/DomainsContext';
import UserContext from '../../utils/UserContext';

export default function deleteAccount() {
  const { Adspl } = useContext(DomainsContext);
  const user = useContext(UserContext);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [success, setSuccess] = useState(false);
  const emailRef = createRef();

  return (
    <Layout>
      <AdsplMenu />

      <br />
      <table>
        <tbody>
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
          const email = emailRef.current.value;
          if (email) {
            setLoading(true);
            setError(false);
            setSuccess(false);
            Adspl.deleteAccount(email, user)
              .then(() => {
                setLoading(false);
                setError(false);
                setSuccess(true);
              })
              .catch(() => {
                setLoading(false);
                setError(true);
                setSuccess(false);
              });
          }
        }}
      >
        Supprimer le compte
      </button>
      {loading && <label>En cours...</label>}
      {error && <label>Une erreur est survenue</label>}
      {success && <label>Le compte à bien été supprimé</label>}
      <style jsx>{`
        input {
          margin-left: 0.5em;
        }
      `}</style>
    </Layout>
  );
}
