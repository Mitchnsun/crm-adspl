import createAuth from '../drivers/auth-test';
import createRouter from '../drivers/router-test';
import createDb from '../drivers/db-test';
import createListener from '../drivers/listeners-test';

export default function getDrivers(config = {}) {
  return {
    auth: createAuth(config.auth),
    router: createRouter(),
    db: createDb(config.db),
    createListener,
  };
}
