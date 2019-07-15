import colors from '../styles/colors';

const TYPES = {
  primary: 'h2',
  secondary: 'h3',
  subtitle: 'h4',
};

export default function Title({ type, children }) {
  const Comp = TYPES[type] || TYPES.secondary;
  return (
    <React.Fragment>
      <Comp>{children}</Comp>
      <style jsx>{`
        h2 {
          margin-top: 0;
          margin-bottom: 1em;
          font-size: 2em;
          color: ${colors.BLACK};
        }
        h3 {
          margin-top: 0;
          margin-bottom: 0.5em;
          font-size: 1.5em;
          font-weight: normal;
          color: ${colors.PRIMARY};
        }
        h4 {
          margin: 0;
          padding: 2px 0;
          font-weight: normal;
          color: ${colors.SECONDARY};
          border-bottom: 1px solid ${colors.SECONDARY};
        }
      `}</style>
    </React.Fragment>
  );
}
