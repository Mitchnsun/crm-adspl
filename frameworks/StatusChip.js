import colors from '../styles/colors';

const STATUS = {
  PENDING: {
    color: colors.WARNING,
    label: 'En attente',
  },
  IN_PROGRESS: {
    color: colors.INDIGO,
    label: 'En cours',
  },
  BLOCKED: {
    color: colors.ERROR,
    label: 'Bloqué',
  },
  RESOLVED: {
    color: colors.SUCCESS,
    label: 'Résolu',
  },
  CLOSED: {
    color: colors.SKY_DARK,
    label: 'Fermé',
  },
  DEFAULT: {
    color: colors.GRAY,
  },
};

export default function ChipStatus({ status }) {
  const chip = STATUS[status] || STATUS.DEFAULT;
  return (
    <React.Fragment>
      <span>{chip.label || status}</span>
      <style jsx>{`
        span {
          display: inline-block;
          margin: 0 5px;
          padding: 4px 8px;
          background-color: ${chip.color};
          color: white;
          font-size: 0.8rem;
          border-radius: 3px;
          font-weight: 600;
          line-height: 20px;
          text-align: center;
        }
      `}</style>
    </React.Fragment>
  );
}
