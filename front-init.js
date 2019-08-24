import createAuth from './drivers/auth-test';
import createRouter from './drivers/router-next';
import createDb from './drivers/db-test';
import createDbList from './drivers/db-test';
import createListener from './drivers/listeners-test';
import createAdsplDriver from './drivers/adspl-firebase';

import createSession from './domains/Session';
import createDbMocked from './drivers/db-mocked';
import createTickets from './domains/Tickets';
import createAdspl from './domains/Adspl';

// createDbMocked();

export default function init() {
  const drivers = {
    auth: createAuth(),
    router: createRouter(),
    db: createDb(),
    dbList: createDbList(),
    createListener,
    adspl: createAdsplDriver(),
  };

  return {
    session: createSession(drivers),
    Tickets: createTickets(drivers),
    Adspl: createAdspl(drivers),
  };
}
