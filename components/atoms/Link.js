import Link from 'next/link';
import colors from '../../styles/colors';

export default function Linkup({ as, url, children }) {
  return (
    <React.Fragment>
      <Link as={as} href={url}>
        <a>{children}</a>
      </Link>
      <style jsx>{`
        a {
          text-decoration: none;
          color: ${colors.INDIGO};
          font-family: 'Helvetica';
        }

        a:hover {
          opacity: 0.6;
        }
      `}</style>
    </React.Fragment>
  );
}
