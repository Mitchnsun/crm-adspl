import App, { Container } from 'next/app';

import init from '../front-init';
import SessionContext from '../utils/SessionContext';
import { Authentication } from '../components/organismes/Authentication';
const { session, Tickets, Adspl } = init();

class MyApp extends App {
  constructor() {
    super();

    this.state = {
      user: null,
    };
  }

  static async getInitialProps({ Component, ctx }) {
    let pageProps = {};

    if (Component.getInitialProps) {
      pageProps = await Component.getInitialProps(ctx, { Tickets });
    }

    return { pageProps };
  }

  componentDidCatch(err) {
    console.error('CATCH', err);
  }

  render() {
    const { Component, pageProps } = this.props;
    return (
      <Container>
        <SessionContext.Provider value={session}>
          <Authentication currentRoute={this.props.router.route}>
            <Component {...pageProps} {...this.state} Tickets={Tickets} Adspl={Adspl} />
          </Authentication>
        </SessionContext.Provider>
      </Container>
    );
  }
}

export default MyApp;
