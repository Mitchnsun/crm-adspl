import createSession from '../domains/Session';
import getDrivers from './drivers';
import defer from './defer';
import { fail } from 'assert';

function initSession() {
  return createSession(
    getDrivers({
      auth: {
        add: [{ uid: '1234', id: 'agent', password: 'coulson' }, { uid: '3456', id: 'tony', password: 'stark' }],
      },
      db: {
        users: {
          add: [
            {
              id: '1234',
              firstname: 'Agent',
              lastname: 'Coulson',
              email: 'agent.coulson@yopmail.com',
              isActive: true,
              role: 'agent',
            },
            {
              id: '3456',
              firstname: 'Tony',
              lastname: 'Stark',
              email: 'tony.stark@yopmail.com',
              isActive: true,
              role: 'admin',
            },
          ],
        },
      },
    }),
  );
}

function sessionChange(session) {
  const deferred = defer();
  session.listen(({ user }) => {
    deferred.resolve(user);
  });

  return deferred.promise;
}

describe('Session', () => {
  describe('Given a User', () => {
    it('should be able to log in as Agent', async () => {
      const session = initSession();

      expect(session.getCurrentUser()).toBe(null);

      await session.login('agent', 'coulson');

      const user = await sessionChange(session);

      expect(user.uid).toBe('1234');
      expect(user.isAdmin()).toBe(false);

      expect(user).toEqual(session.getCurrentUser());
      expect(session.isUserAdmin()).toBe(false);
    });

    it('should be able to log in as Admin', async () => {
      const session = initSession();

      expect(session.getCurrentUser()).toBe(null);

      await session.login('tony', 'stark');

      const user = await sessionChange(session);

      expect(user.uid).toBe('3456');
      expect(user.isAdmin()).toBe(true);

      expect(user).toEqual(session.getCurrentUser());
      expect(session.isUserAdmin()).toBe(true);
    });

    it('should be not be able to log in if not exist', async () => {
      const session = initSession();

      expect(session.getCurrentUser()).toBe(null);

      return session
        .login('Mario', 'Bros')
        .then(() => fail('It should be rejected!'))
        .catch(e => expect(e.message).toEqual('User not found'));
    });

    it('should be not be able to log in if not active', async () => {
      const session = initSession();

      expect(session.getCurrentUser()).toBe(null);

      return session
        .login('Mario', 'Bros')
        .then(() => fail('It should be rejected!'))
        .catch(e => expect(e.message).toEqual('User not found'));
    });

    it('should be able to log out', async () => {
      const session = initSession();

      await session.login('tony', 'stark');
      const user = await sessionChange(session);
      expect(user.uid).toBe('3456');

      session.logout();
      const value = await sessionChange(session);
      expect(value).toBe(null);

      expect(value).toEqual(session.getCurrentUser());
      expect(session.isUserAdmin()).toBe(false);
    });

    it('should be able to create an account (success)', async () => {
      const session = initSession();

      await session
        .createAccount({
          firstname: 'Bruce',
          lastname: 'Banner',
          email: 'bruce.banner@yopmail.com',
          password: 'hulk',
        })
        .catch(e => fail('It should be resolved!' + e.message));

      await session.login('tony', 'stark');
      const user = await sessionChange(session);

      const users = await user.users.fetch();
      expect(users.find(a => a.firstname === 'Bruce')).toEqual({
        id: expect.anything(),
        firstname: 'Bruce',
        lastname: 'Banner',
        email: 'bruce.banner@yopmail.com',
        isActive: false,
        role: 'agent',
      });
    });

    it('should be able to create an account (failure)', () => {
      const session = initSession();

      return session
        .createAccount({
          firstname: 'Bruce',
          lastname: 'Banner',
          password: 'hulk',
        })
        .then(() => fail('It should be rejected!'))
        .catch(e => {
          expect(e.message).toEqual('Missing required value! [email]');
        });
    });
  });
});
