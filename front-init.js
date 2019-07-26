import createAuth from './drivers/auth-test';
import createRouter from './drivers/router-next';
import createDb from './drivers/db-mocked';
import createListener from './drivers/listeners-test';

import createSession from './domains/Session';

export default function init() {
  const drivers = {
    auth: createAuth(),
    router: createRouter(),
    db: createDb(),
    createListener,
  };

  return {
    session: createSession(drivers),
  };
}
