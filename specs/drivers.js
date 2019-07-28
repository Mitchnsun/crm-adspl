import createAuth from '../drivers/auth-test';
import createRouter from '../drivers/router-test';
import createDb from '../drivers/db-test';
import createListener from '../drivers/listeners-test';

export default function getDrivers() {
  return {
    auth: createAuth(),
    router: createRouter(),
    db: createDb(),
    createListener,
  };
}
