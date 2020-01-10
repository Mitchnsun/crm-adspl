import { useContext, useState } from 'react';
import SessionContext from '../utils/SessionContext';

function SignIn({ signIn }) {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  return (
    <div className="item">
      <div className="line">
        Login: <input type="text" name="login" value={login} onChange={e => setLogin(e.target.value)} />
      </div>
      <div className="line">
        Password: <input type="password" name="password" value={password} onChange={e => setPassword(e.target.value)} />
      </div>
      <button
        onClick={() => {
          signIn(login, password).catch(err => setError(err.message));
        }}
      >
        Se Connecter
      </button>
      {error && <p className="error">{error}</p>}
    </div>
  );
}

function CreateAccount({ createAccount }) {
  const [lastname, setLastname] = useState('');
  const [firstname, setFirstname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  return (
    <div className="item account">
      <div className="line">
        Nom:{' '}
        <input
          type="text"
          name="lastname"
          value={lastname}
          onChange={e => setLastname(e.target.value)}
          autoComplete="off"
        />
      </div>
      <div className="line">
        Prénom:{' '}
        <input
          type="text"
          name="firstname"
          value={firstname}
          onChange={e => setFirstname(e.target.value)}
          autoComplete="off"
        />
      </div>
      <div className="line">
        Email:{' '}
        <input type="email" name="email" value={email} onChange={e => setEmail(e.target.value)} autoComplete="off" />
      </div>
      <div className="line">
        Password:{' '}
        <input
          type="password"
          name="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          autoComplete="off"
        />
      </div>
      <button
        onClick={() => {
          if (!firstname && !lastname && !email && !password) return;
          createAccount({ firstname, lastname, email, password })
            .then(() => {
              setSuccess('Le compte à bien été créé. Vérifiez vos emails pour terminé la création de compte.');
              setFirstname('');
              setLastname('');
              setEmail('');
              setPassword('');
              setError('');
            })
            .catch(err => {
              setSuccess('');
              setError(err.message);
            });
        }}
      >
        Créer un compte
      </button>

      {success && <p className="success">{success}</p>}
      {error && <p className="error">{error}</p>}
    </div>
  );
}

export default function LoginPage() {
  const session = useContext(SessionContext);
  return (
    <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', height: '100%' }}>
      <div className="container">
        <CreateAccount createAccount={session.createAccount} />
        <SignIn signIn={session.login} />
      </div>

      <style global jsx>{`
        html,
        body,
        #__next {
          height: 100%;
        }

        .line {
          display: flex;
          justify-content: space-between;
        }
        .container .item:first-child {
          border-right: solid 1px;
        }
        .item {
          padding: 2em;
        }
        .container {
          display: flex;
          margin-right: 30%;
        }
        .error {
          font-weight: bold;
          color: red;
        }
        .success {
          font-weight: bold;
          color: green;
        }
        .account {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
        }
      `}</style>
    </div>
  );
}
