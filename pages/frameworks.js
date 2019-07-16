import Layout from '../components/Layout';
import Title from '../frameworks/Title';
import StatusChip from '../frameworks/StatusChip';
import Link from '../frameworks/Link';

const CHIP_STATUS = ['PENDING', 'IN_PROGRESS', 'BLOCKED', 'RESOLVED', 'CLOSED', 'NO_STATUS'];

const divStyle = {
  marginTop: 10,
};

export default function Frameworks() {
  return (
    <Layout>
      <Title type="primary">This is the frameworks page</Title>
      <Title type="secondary">Ticket</Title>
      <Title type="subtitle">Component StatusChip</Title>
      <div style={divStyle}>
        {CHIP_STATUS.map(status => (
          <StatusChip status={status} />
        ))}
      </div>
      <br />
      <Link url="/dashboard">Retour au dashboard</Link>
    </Layout>
  );
}
