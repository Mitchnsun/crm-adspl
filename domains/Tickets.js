export default function createTickets(drivers, counters) {
  const dbTickets = drivers.dbList('tickets');
  const counter = counters.of('tickets');
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
    addTicket(params, user) {
      if (!params || !user) return Promise.reject(new Error('Params ou user missing'));
      if (!params.title) return Promise.reject(new Error('Params title missing'));
      if (!params.description) return Promise.reject(new Error('Params description missing'));
      return counter.get().then(value => {
        return dbTickets.add({
          id: dbTickets.generateId(),
          idNum: value,
          createAt: Date.now(),
          ...params,
          createBy: user.id,
          author: user.firstname + ' ' + user.lastname,
        });
      });
    },
    addComment(params, user) {
      if (!params || !user) return Promise.reject(new Error('Params ou user missing'));
      if (!params.comment) return Promise.reject(new Error('Params comment missing'));
      if (!params.ticket) return Promise.reject(new Error('Params ticket missing'));
      const updatedTicket = {
        ...params.ticket,
        comments: (params.ticket.comments || []).concat([
          {
            text: params.comment,
            by: user.id,
            createAt: Date.now(),
          },
        ]),
      };
      return dbTickets.update(updatedTicket).then(() => {
        return updatedTicket;
      });
    },
    updateComment(params, user) {
      if (!params || !user) return Promise.reject(new Error('Params ou user missing'));
      if (!params.comment) return Promise.reject(new Error('Params comment missing'));
      if (!params.ticket) return Promise.reject(new Error('Params ticket missing'));
      const updatedTicket = {
        ...params.ticket,
        comments: (params.ticket.comments || []).map(c => {
          if (c.createAt === params.comment.createAt && c.by === params.comment.by) {
            return params.comment;
          }
          return c;
        }),
      };
      return dbTickets.update(updatedTicket).then(() => {
        return updatedTicket;
      });
    },
    closeTicket(params, user) {
      if (!params || !user) return Promise.reject(new Error('Params ou user missing'));
      if (!params.ticket) return Promise.reject(new Error('Params ticket missing'));

      const comments = params.ticket.comments || [];
      const updatedTicket = {
        ...params.ticket,
        status: 'CLOSED',
        comments: params.comment
          ? comments.concat([
              {
                text: params.comment,
                by: user.id,
                createAt: Date.now(),
              },
            ])
          : comments,
      };
      return dbTickets.update(updatedTicket).then(() => {
        return updatedTicket;
      });
    },
    reopenTicket(params, user) {
      if (!params || !user) return Promise.reject(new Error('Params ou user missing'));
      if (!params.ticket) return Promise.reject(new Error('Params ticket missing'));

      const comments = params.ticket.comments || [];
      const updatedTicket = {
        ...params.ticket,
        status: 'IN_PROGRESS',
        comments: params.comment
          ? comments.concat([
              {
                text: params.comment,
                by: user.id,
                createAt: Date.now(),
              },
            ])
          : comments,
      };
      return dbTickets.update(updatedTicket).then(() => {
        return updatedTicket;
      });
    },
    updateTitle({ ticket, value }, user) {
      const updatedTicket = {
        ...ticket,
        title: value,
      };
      return dbTickets.update(updatedTicket).then(() => {
        return updatedTicket;
      });
    },
    updateDescription({ ticket, value }, user) {
      const updatedTicket = {
        ...ticket,
        description: value,
      };
      return dbTickets.update(updatedTicket).then(() => {
        return updatedTicket;
      });
    },
  };
}
