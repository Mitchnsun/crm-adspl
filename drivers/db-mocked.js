import createDb from './db-test';
import createDbList from './db-firestore';

export default function createDbMocked() {
  console.log('createDbMocked');
  const db = createDb();
  const dbList = createDbList();
  const dbTickets = dbList('tickets');

  [
    { id: '1', title: 'SIREN perdu', status: 'RESOLVED', author: 'Matthieu Compérat', followers: ['1'] },
    {
      id: '2',
      title: 'Mot de passe erroné',
      status: 'IN_PROGRESS',
      author: 'Grégory Magallon',
      follower: '1',
      followers: ['1'],
    },
    { id: '3', title: 'Email oublié', status: 'PENDING', author: 'Enguerran Brembilla', followers: [] },
    { id: '3', title: 'Email oublié', status: 'PENDING', author: 'Enguerran Brembilla', followers: [] },
    {
      id: '4',
      title: 'Email oublié',
      status: 'PENDING',
      author: 'Enguerran Brembilla',
      follower: '1',
      followers: ['1'],
    },
    { id: '5', title: 'Email oublié', status: 'PENDING', author: 'Enguerran Brembilla', followers: [] },
    { id: '6', title: 'Email oublié', status: 'PENDING', author: 'Enguerran Brembilla', followers: [] },
    {
      id: '7',
      title: 'Email oublié',
      status: 'IN_PROGRESS',
      author: 'Enguerran Brembilla',
      follower: '1',
      followers: ['1'],
    },
    { id: '8', title: 'Email oublié', status: 'PENDING', author: 'Enguerran Brembilla', followers: [] },
    { id: '9', title: 'Email oublié', status: 'PENDING', author: 'Enguerran Brembilla', followers: [] },
    { id: '10', title: 'Email oublié', status: 'PENDING', author: 'Enguerran Brembilla', followers: [] },
    { id: '11', title: 'Email oublié', status: 'PENDING', author: 'Enguerran Brembilla', followers: [] },
    { id: '12', title: 'Email oublié', status: 'PENDING', author: 'Enguerran Brembilla', followers: [] },
    {
      id: '13',
      title: 'Email oublié',
      status: 'IN_PROGRESS',
      author: 'Enguerran Brembilla',
      follower: '1',
      followers: ['1'],
    },
    { id: '14', title: 'Email oublié', status: 'PENDING', author: 'Enguerran Brembilla', followers: [] },
    { id: '15', title: 'Email oublié', status: 'PENDING', author: 'Enguerran Brembilla', followers: [] },
    { id: '16', title: 'Email oublié', status: 'RESOLVED', author: 'Enguerran Brembilla', followers: [] },
    { id: '17', title: 'Email oublié', status: 'PENDING', author: 'Enguerran Brembilla', followers: [] },
    { id: '18', title: 'Email oublié', status: 'PENDING', author: 'Enguerran Brembilla', followers: [] },
  ].forEach((d, i) => dbTickets.add({ ...d, createAt: Date.now() + i }));

  const dbAuth = db('auth');
  [
    {
      uid: '1',
      id: 'admin',
      password: 'admin',
    },
    {
      uid: '2',
      id: 'agent',
      password: 'agent',
    },
  ].forEach(dbAuth.add);

  const dbUsers = db('users');
  [
    { id: '1', firstname: 'Nick', lastname: 'Fury', email: 'nick.fury@yopmail.com', isActive: true, role: 'admin' },
    { id: '2', firstname: 'Tony', lastname: 'Stark', email: 'tony.stark@yopmail.com', isActive: true, role: 'agent' },
    {
      id: '3',
      firstname: 'Peter',
      lastname: 'Parker',
      email: 'peter.parker@yopmail.com',
      isActive: false,
      role: 'agent',
    },
  ].forEach(dbUsers.add);

  return db;
}
