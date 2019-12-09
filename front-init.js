import createAuth from './drivers/auth-firebase';
import createRouter from './drivers/router-next';
import createDb from './drivers/db-firebase';
import createDbList from './drivers/db-firestore';
import createListener from './drivers/listeners-test';
import createAdsplDriver from './drivers/adspl-firebase';

import createSession from './domains/Session';
import createTickets from './domains/Tickets';
import createAdspl from './domains/Adspl';
import createUsers from './domains/Users';
import createCounters from './domains/Counters';
import createEmails from './domains/Emails';
import createActivities from './domains/Activities';

export default function init() {
  const drivers = {
    auth: createAuth(),
    router: createRouter(),
    db: createDb(),
    dbList: createDbList(),
    createListener,
    adspl: createAdsplDriver(),
  };
  const Activities = createActivities(drivers);
  return {
    Session: createSession(drivers),
    Tickets: createTickets(drivers, createCounters(drivers), Activities),
    Users: createUsers(drivers, Activities),
    Adspl: createAdspl(drivers),
    Emails: createEmails(drivers),
    Activities,
  };
}
