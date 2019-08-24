export default function createTickets(drivers) {
  const dbTickets = drivers.dbList('tickets');

  return {
    defaultValue: [],
    followedBy: (ticket, user) => {
      return ticket.followers.includes(user.id);
    },
    fetchTicket: id => dbTickets.get(id),
    removeFollower: (ticket, user) => {
      if (user && ticket.followers && ticket.followers.includes(user.id)) {
        const status = ticket.followers.length === 1 ? 'PENDING' : 'IN_PROGRESS';
        const updatedTicket = {
          ...ticket,
          status,
          followers: ticket.followers.filter(uid => uid !== user.id),
          _history: (ticket._history || []).concat([
            {
              update: 'followers-and-status',
              removedFollower: user.id,
              newStatus: status,
              on: new Date().toISOString(),
            },
          ]),
        };
        return dbTickets.update(updatedTicket).then(() => updatedTicket);
      }
      return Promise.resolve(ticket);
    },
    addFollower: (ticket, user) => {
      if (user && (!ticket.followers || !ticket.followers.includes(user.id))) {
        const updatedTicket = {
          ...ticket,
          status: 'IN_PROGRESS',
          followers: (ticket.followers || []).concat([user.id]),
          _history: (ticket._history || []).concat([
            {
              update: 'followers-and-status',
              addedFollower: user.id,
              newStatus: 'IN_PROGRESS',
              on: new Date().toISOString(),
            },
          ]),
        };
        return dbTickets.update(updatedTicket).then(() => updatedTicket);
      }
      return Promise.resolve(ticket);
    },
    getAll: async config => {
      const all = await dbTickets.getAll(config);
      return all || [];
    },
  };
}
