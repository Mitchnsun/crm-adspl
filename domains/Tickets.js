export default function createTickets(drivers) {
  return uid => {
    const tickets = drivers.db('tickets', uid);
    return tickets;
  };
}
