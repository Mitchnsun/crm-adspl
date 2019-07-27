import createDb from './db-test';

export default function createDbMocked() {
  const db = createDb();
  const dbTickets = db('tickets', '1234567');

  [
    { id: 1, title: 'SIREN perdu', status: 'RESOLVED', author: 'Matthieu Compérat' },
    { id: 2, title: 'Mot de passe erroné', status: 'IN_PROGRESS', author: 'Grégory Magallon' },
    { id: 3, title: 'Email oublié', status: 'PENDING', author: 'Enguerran Brembilla' },
  ].forEach(dbTickets.add);

  const dbAgents = db('agents');
  [
    { id: 1, firstname: 'Nick', lastname: 'Fury' },
    { id: 2, firstname: 'Tony', lastname: 'Stark' },
    { id: 3, firstname: 'Peter', lastname: 'Parker' },
  ].forEach(dbAgents.add);

  return db;
}
