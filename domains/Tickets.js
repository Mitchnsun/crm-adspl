import { omit } from 'lodash';

function applyEvent(ticket, event) {
  switch (event.type) {
    case 'update-description': {
      return {
        ...ticket,
        _history: (ticket._history || []).concat([event]),
        description: event.value,
      };
    }
    case 'update-title': {
      return {
        ...ticket,
        _history: (ticket._history || []).concat([event]),
        title: event.value,
      };
    }
    case 'reopen-ticket': {
      return {
        ...ticket,
        _history: (ticket._history || []).concat([event]),
        status: 'IN_PROGRESS',
        comments: event.comment ? (ticket.comments || []).concat([event.comment]) : ticket.comments,
      };
    }
    case 'close-ticket': {
      return {
        ...ticket,
        _history: (ticket._history || []).concat([event]),
        status: 'CLOSED',
        comments: event.comment ? (ticket.comments || []).concat([event.comment]) : ticket.comments,
      };
    }
    case 'add-comment': {
      return {
        ...ticket,
        _history: (ticket._history || []).concat([event]),
        comments: (ticket.comments || []).concat([event.value]),
      };
    }
    case 'add-follower': {
      return {
        ...ticket,
        _history: (ticket._history || []).concat([event]),
        followers: ticket.followers.concat([event.value]),
        status: ticket.status === 'PENDING' ? 'IN_PROGRESS' : ticket.status,
      };
    }
    case 'remove-follower': {
      const newFollowers = ticket.followers.filter(uid => uid !== event.value);
      return {
        ...ticket,
        _history: (ticket._history || []).concat([event]),
        followers: newFollowers,
        status: ticket.status === 'IN_PROGRESS' && newFollowers.length === 0 ? 'PENDING' : ticket.status,
      };
    }
    case 'update-comment': {
      return {
        ...ticket,
        _history: (ticket._history || []).concat([event]),
        comments: (ticket.comments || []).map(c => {
          if (c.createAt === event.comment.createAt && c.by === event.comment.by) {
            return {
              _history: (event.comment._history || []).concat([omit(event.comment, '_history')]),
              text: event.newText,
              createAt: event.on,
              by: event.by,
            };
          }
          return c;
        }),
      };
    }
    default:
      return ticket;
  }
}

export default function createTickets(drivers, counters) {
  const dbTickets = drivers.dbList('tickets');
  const counter = counters.of('tickets');

  const persist = ticket => dbTickets.update(ticket).then(() => ticket);

  return {
    defaultValue: [],
    followedBy: (ticket, user) => {
      return ticket.followers.includes(user.id);
    },
    fetchTicket: id => dbTickets.get(id),
    removeFollower: (ticket, user) => {
      const updatedTicket = applyEvent(ticket, {
        type: 'remove-follower',
        on: Date.now(),
        by: user.id,
        value: user.id,
      });
      return persist(updatedTicket);
    },
    addFollower: (ticket, user) => {
      const updatedTicket = applyEvent(ticket, {
        type: 'add-follower',
        on: Date.now(),
        by: user.id,
        value: user.id,
      });
      return persist(updatedTicket);
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
          _history: [],
        });
      });
    },
    addComment(params, user) {
      const updatedTicket = applyEvent(params.ticket, {
        type: 'add-comment',
        on: Date.now(),
        by: user.id,
        value: {
          text: params.comment,
          by: user.id,
          createAt: Date.now(),
        },
      });
      return persist(updatedTicket);
    },
    updateComment(params, user) {
      const updatedTicket = applyEvent(params.ticket, {
        type: 'update-comment',
        on: Date.now(),
        by: user.id,
        comment: params.comment,
        newText: params.newText,
      });
      return persist(updatedTicket);
    },
    closeTicket(params, user) {
      const updatedTicket = applyEvent(params.ticket, {
        type: 'close-ticket',
        on: Date.now(),
        by: user.id,
        comment: params.comment
          ? {
              text: params.comment,
              by: user.id,
              createAt: Date.now(),
            }
          : null,
      });
      return persist(updatedTicket);
    },
    reopenTicket(params, user) {
      const updatedTicket = applyEvent(params.ticket, {
        type: 'reopen-ticket',
        on: Date.now(),
        by: user.id,
        comment: params.comment
          ? {
              text: params.comment,
              by: user.id,
              createAt: Date.now(),
            }
          : null,
      });
      return persist(updatedTicket);
    },
    updateTitle({ ticket, value }, user) {
      const updatedTicket = applyEvent(ticket, {
        type: 'update-title',
        on: Date.now(),
        by: user.id,
        value,
        was: ticket.title,
      });
      return persist(updatedTicket);
    },
    updateDescription({ ticket, value }, user) {
      const updatedTicket = applyEvent(ticket, {
        type: 'update-description',
        on: Date.now(),
        by: user.id,
        value,
        was: ticket.description,
      });
      return persist(updatedTicket);
    },
  };
}
