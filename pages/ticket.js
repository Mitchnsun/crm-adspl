import Title from '../components/atoms/Title';
import Layout from '../components/organismes/Layout';
// import fetch from 'isomorphic-unfetch';

const Ticket = props => (
  <Layout>
    <Title type="primary">{props.title || 'Title'}</Title>
    <p>Ticket #{props.id || 'ID'}</p>
  </Layout>
);

Ticket.getInitialProps = async function(context) {
  const { id, title } = context.query;
  /* const res = await fetch(`//api/url`);
  const data = await res.json();
  return { data }; */
  return { id, title };
};

export default Ticket;
