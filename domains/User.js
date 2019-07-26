import createTickets from './Tickets';

export default function createUser(drivers) {
  const initUserTickets = createTickets(drivers);
  return (uid, role) => {
    return {
      uid,
      isAdmin: () => role === 'admin',
      tickets: initUserTickets(uid),
    };
  };
}
