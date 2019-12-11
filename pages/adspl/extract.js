import { useContext, useState } from 'react';
import { AdsplMenu } from '../../components/molecules/AdsplMenu';
import Layout from '../../components/organismes/Layout';
import DomainsContext from '../../utils/DomainsContext';
import UserContext from '../../utils/UserContext';

export default function extract() {
  const { Adspl } = useContext(DomainsContext);
  const user = useContext(UserContext);
  const [year, setYear] = useState('2018');
  return (
    <Layout>
      <AdsplMenu />

      <br />
      <div className="radio">
        <input type="radio" name="year" value="2018" checked={year === '2018'} onClick={() => setYear('2018')} />
        <label>2018</label>
      </div>
      <div className="radio">
        <input type="radio" name="year" value="2019" checked={year === '2019'} onClick={() => setYear('2019')} />
        <label>2019</label>
      </div>
      <br />
      <button onClick={() => Adspl.downloadExtract(year, user)}>Extraire les données sous format CSV</button>
      <style jsx>{`
        input {
          margin-right: 0.5em;
        }
      `}</style>
    </Layout>
  );
}
