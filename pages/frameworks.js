import Layout from '../components/Layout.js';
import Title from '../frameworks/Title';
import Link from '../frameworks/Link';

export default function Frameworks() {
  return (
    <Layout>
      <Title type="primary">This is the frameworks page</Title>
      <Title type="secondary">This is the frameworks page</Title>
      <Title type="subtitle">This is the frameworks page</Title>
      <br />
      <Link url="/dashboard">Retour au dashboard</Link>
    </Layout>
  );
}
