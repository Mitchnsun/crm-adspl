import createDb from './db-test';

export default function createDbMocked() {
  console.log('createDbMocked');
  const db = createDb();
  const dbTickets = db('tickets', '1234567');

  [
    { id: 1, title: 'SIREN perdu', status: 'RESOLVED', author: 'Matthieu Compérat' },
    { id: 2, title: 'Mot de passe erroné', status: 'IN_PROGRESS', author: 'Grégory Magallon' },
    { id: 3, title: 'Email oublié', status: 'PENDING', author: 'Enguerran Brembilla' },
  ].forEach(dbTickets.add);

  const dbAuth = db('auth');
  [
    {
      uid: 1,
      id: 'admin',
      password: 'admin',
    },
    {
      uid: 2,
      id: 'agent',
      password: 'agent',
    },
  ].forEach(dbAuth.add);

  const dbUsers = db('users');
  [
    { id: 1, firstname: 'Nick', lastname: 'Fury', email: 'nick.fury@yopmail.com', isActive: true, role: 'admin' },
    { id: 2, firstname: 'Tony', lastname: 'Stark', email: 'tony.stark@yopmail.com', isActive: true, role: 'agent' },
    {
      id: 3,
      firstname: 'Peter',
      lastname: 'Parker',
      email: 'peter.parker@yopmail.com',
      isActive: false,
      role: 'agent',
    },
  ].forEach(dbUsers.add);

  return db;
}
