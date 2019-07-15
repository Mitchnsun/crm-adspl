import Link from 'next/link';
import colors from '../styles/colors';

const Header = () => (
  <header>
    <Link href="/dashboard">
      <a>Dashboard</a>
    </Link>
    <Link href="/frameworks">
      <a>Frameworks</a>
    </Link>
    <style jsx>{`
      header {
        background-color: ${colors.BLACK};
        font-size: 14px;
        line-height: 1.5;
        padding: 16px;
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

export default Header;
