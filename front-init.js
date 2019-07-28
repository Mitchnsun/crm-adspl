import createAuth from './drivers/auth-firebase';
import createRouter from './drivers/router-next';
import createDb from './drivers/db-firebase';
import createListener from './drivers/listeners-test';

import createSession from './domains/Session';
import createDbMocked from './drivers/db-mocked';

createDbMocked();

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
