import Layout from '../components/Layout.js';
import fetch from 'isomorphic-unfetch';

const Ticket = props => (
  <Layout>
    <h1>{props.title || 'Title'}</h1>
    <p>Ticket #{props.id || 'ID'}</p>
  </Layout>
);

Ticket.getInitialProps = async function(context) {
  const { id, title } = context.query;
  /*const res = await fetch(`//api/url`);
  const data = await res.json();
  return { data };*/
  return { id, title };
};

export default Ticket;