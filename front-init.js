import createAuth from './drivers/auth-firebase';
import createRouter from './drivers/router-next';
import createDb from './drivers/db-firebase';
import createDbList from './drivers/db-firestore';
import createListener from './drivers/listeners-test';

import createSession from './domains/Session';
import createDbMocked from './drivers/db-mocked';
import createTickets from './domains/Tickets';

createDbMocked();

export default function init() {
  const drivers = {
    auth: createAuth(),
    router: createRouter(),
    db: createDb(),
    dbList: createDbList(),
    createListener,
  };

  return {
    session: createSession(drivers),
    Tickets: createTickets(drivers),
  };
}
