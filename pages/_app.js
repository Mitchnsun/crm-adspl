import App from 'next/app';

import init from '../front-init';
import SessionContext from '../utils/SessionContext';
import DomainsContext from '../utils/DomainsContext';
import { Authentication } from '../components/organismes/Authentication';
import colors from '../styles/colors';
const { Session, Tickets, Users, Adspl, Emails, Activities } = init();

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
      <SessionContext.Provider value={Session}>
        <DomainsContext.Provider value={{ Adspl, Tickets, Users, Emails, Activities }}>
          <Authentication currentRoute={this.props.router.asPath}>
            <Component {...pageProps} {...this.state} />
          </Authentication>
          <style jsx global>{`
            * {
              color: ${colors.SKY_DARK};
            }
          `}</style>
        </DomainsContext.Provider>
      </SessionContext.Provider>
    );
  }
}

export default MyApp;
