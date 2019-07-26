import createTickets from './Tickets';

export default function createUser(drivers) {
  const initUserTickets = createTickets(drivers);
  return uid => {
    return {
      uid,
      tickets: initUserTickets(uid),
    };
  };
}
