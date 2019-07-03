import Link from 'next/link';

const linkStyle = {
  marginRight: 15,
};

const Header = () => (
  <div>
    <Link href="/dashboard">
      <a style={linkStyle}>Dashboard</a>
    </Link>
    <Link href="/about">
      <a style={linkStyle}>About</a>
    </Link>
  </div>
);

export default Header;
