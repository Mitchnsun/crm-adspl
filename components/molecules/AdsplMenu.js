import { useContext } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import colors from '../../styles/colors';
import UserContext from '../../utils/UserContext';

export function AdsplMenu() {
  const user = useContext(UserContext);
  const router = useRouter();
  return (
    <div>
      <Link href="/adspl">
        <button className={router.pathname === '/adspl' ? 'active' : ''}>Recherche</button>
      </Link>
      <Link href="/adspl/email-activation">
        <button className={router.pathname === '/adspl/email-activation' ? 'active' : ''}>Activation d'email</button>
      </Link>
      <Link href="/adspl/check-entry">
        <button className={router.pathname === '/adspl/check-entry' ? 'active' : ''}>Saisie de chèque</button>
      </Link>
      {user.isAdmin() && (
        <Link href="/adspl/extract">
          <button className={router.pathname === '/adspl/extract' ? 'active' : ''}>Extraction</button>
        </Link>
      )}
      <style jsx>{`
        .active {
          background-color: ${colors.SKY_DARK};
          color: white;
        }
        button {
          padding: 5px;
          border: 1px solid ${colors.SKY_DARK};
          border-radius: 5px;
          cursor: pointer;
          margin-right: 0.5rem;
        }
        div {
          margin-bottom: 1em;
        }
      `}</style>
    </div>
  );
}
