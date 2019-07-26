import { useContext } from 'react';
import SessionContext from '../utils/SessionContext';

export default function LoginPage() {
  const session = useContext(SessionContext);
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
      <button onClick={session.login}>Connect</button>
      <style global jsx>{`
        html,
        body,
        #__next {
          height: 100%;
        }
      `}</style>
    </div>
  );
}
