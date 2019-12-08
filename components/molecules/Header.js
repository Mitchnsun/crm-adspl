import { useContext } from 'react';
import Link from 'next/link';
import UserContext from '../../utils/UserContext';
import SessionContext from '../../utils/SessionContext';
import colors from '../../styles/colors';

const Header = () => {
  const session = useContext(SessionContext);
  const user = useContext(UserContext);
  return (
    <header>
      <div>
        <Link href="/">
          <a>Tickets</a>
        </Link>
        <Link href="/adspl">
          <a>ADSPL</a>
        </Link>
        {user && user.isAdmin() && (
          <Link href="/users">
            <a>Users</a>
          </Link>
        )}
      </div>

      <div>
        <span style={{ color: 'white', marginRight: '1rem' }}>
          {user.firstname} {user.lastname}
        </span>
        <button onClick={session.logout}>Déconnexion</button>
      </div>

      <style jsx>{`
        header {
          background-color: ${colors.SKY_DARK};
          font-size: 14px;
          line-height: 1.5;
          padding: 16px;

          display: flex;
          justify-content: space-between;
        }
        a {
          margin-right: 16px;
          color: hsl(198, 38%, 95%);
          text-decoration: none;
          font-weight: 600;
          white-space: nowrap;
        }
        a:hover {
          color: hsl(198, 38%, 95%, 0.7);
        }
      `}</style>
    </header>
  );
};

export default Header;
