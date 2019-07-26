import App, { Container } from 'next/app';

import init from '../front-init';
import LoginPage from './login';
import SessionContext from '../utils/SessionContext';

const { session } = init();

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
      pageProps = await Component.getInitialProps(ctx);
    }

    return { pageProps };
  }

  componentWillMount() {
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

    const { user } = this.state;

    return (
      <Container>
        <SessionContext.Provider value={session}>
          {!user ? <LoginPage {...pageProps} {...this.state} /> : <Component {...pageProps} {...this.state} />}
        </SessionContext.Provider>
      </Container>
    );
  }
}

export default MyApp;
