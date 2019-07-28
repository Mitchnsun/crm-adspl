import createSession from '../domains/Session';
import getDrivers from './drivers';
import defer from './defer';
import { fail } from 'assert';

function initSession() {
  return createSession(getDrivers());
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

      session.login('agent', 'coulson');

      const user = await sessionChange(session);

      expect(user.uid).toBe('1234');
      expect(user.isAdmin()).toBe(false);

      expect(user).toEqual(session.getCurrentUser());
      expect(session.isUserAdmin()).toBe(false);
    });

    it('should be able to log in as Admin', async () => {
      const session = initSession();

      expect(session.getCurrentUser()).toBe(null);

      session.login('jar', 'vis');

      const user = await sessionChange(session);

      expect(user.uid).toBe('1234');
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

    it('should be able to log out', async () => {
      const session = initSession();

      session.login('jar', 'vis');
      const user = await sessionChange(session);
      expect(user.uid).toBe('1234');

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
        .catch(() => fail('It should be resolved!'));

      session.login('jar', 'vis');
      const user = await sessionChange(session);

      const agents = await user.agents.fetch();
      expect(agents.find(a => a.firstname === 'Bruce')).toEqual({
        id: expect.anything(),
        firstname: 'Bruce',
        lastname: 'Banner',
        email: 'bruce.banner@yopmail.com',
        password: 'hulk',
        isActive: false,
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
