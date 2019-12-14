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

  const [id, setId] = useState('');
  const [cotisation, setCotisation] = useState('2018');
  const [amount, setAmount] = useState('');
  const [checkNumber, setCheckNumber] = useState('');

  return (
    <Layout>
      <AdsplMenu />

      <br />
      <table>
        <tbody>
          <tr>
            <td>Siret/Siren*</td>
            <td>
              <input type="text" value={id} onChange={evt => setId(evt.target.value)} />
            </td>
          </tr>
          <tr>
            <td>Cotisation</td>
            <td>
              <div style={{ display: 'flex', alignItems: 'baseline' }}>
                <select value={cotisation} onChange={evt => setCotisation(evt.target.value)}>
                  <option>2018</option>
                  <option>20182</option>
                  <option>2019</option>
                </select>
              </div>
            </td>
          </tr>
          <tr>
            <td>Montant*</td>
            <td>
              <input type="number" value={amount} onChange={evt => setAmount(evt.target.value)} />
            </td>
          </tr>
          <tr>
            <td>Numéro de chèque</td>
            <td>
              <input type="text" value={checkNumber} onChange={evt => setCheckNumber(evt.target.value)} />
            </td>
          </tr>
        </tbody>
      </table>
      <br />

      <button
        disabled={loading}
        onClick={() => {
          if (id && cotisation && amount) {
            setLoading(true);
            setError(false);
            Adspl.checkEntry({ id, cotisation, amount, checkNumber }, user)
              .then(() => {
                setLoading(false);
                setError(false);
                setId('');
                setAmount('');
                setCheckNumber('');
              })
              .catch(err => {
                console.log(err);
                setLoading(false);
                setError(true);
              });
          }
        }}
      >
        Enregistrer
      </button>
      {loading && <label>En cours...</label>}
      {error && <label>Une erreur est survenue</label>}
      <style jsx>{`
        input,
        select {
          margin-left: 0.5em;
        }
      `}</style>
    </Layout>
  );
}
