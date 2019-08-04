import App, { Container } from 'next/app';

import init from '../front-init';
import SessionContext from '../utils/SessionContext';

const { session, Tickets } = init();

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

  componentDidMount() {
    this.unsubSession = session.listen(({ user }) => {
      this.setState({ user });
    });
  }

  componentWillUnmount() {
    if (this.unsubSession) this.unsubSession();
    session.unsub();
  }

  render() {
    const { Component, pageProps } = this.props;
    return (
      <Container>
        <SessionContext.Provider value={session}>
          <Component {...pageProps} {...this.state} Tickets={Tickets} />
        </SessionContext.Provider>
      </Container>
    );
  }
}

export default MyApp;
