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

export default function createTickets(drivers, counters, Activities) {
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
      const event = {
        type: 'remove-follower',
        on: Date.now(),
        by: user.id,
        value: user.id,
      };
      const updatedTicket = applyEvent(ticket, event);
      return Activities.log({ scope: 'crm', event, ticketId: ticket.id }, user).then(() => persist(updatedTicket));
    },
    addFollower: (ticket, user) => {
      const event = {
        type: 'add-follower',
        on: Date.now(),
        by: user.id,
        value: user.id,
      };
      const updatedTicket = applyEvent(ticket, event);
      return Activities.log({ scope: 'crm', event, ticketId: ticket.id }, user).then(() => persist(updatedTicket));
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
        const id = dbTickets.generateId();
        return Activities.log(
          { scope: 'crm', event: { type: 'create-ticket', params, on: Date.now(), by: user.id }, ticketId: id },
          user,
        ).then(() => {
          return dbTickets.add({
            id,
            idNum: value,
            createAt: Date.now(),
            ...params,
            createBy: user.id,
            author: user.firstname + ' ' + user.lastname,
            _history: [],
          });
        });
      });
    },
    addComment(params, user) {
      const event = {
        type: 'add-comment',
        on: Date.now(),
        by: user.id,
        value: {
          text: params.comment,
          by: user.id,
          createAt: Date.now(),
        },
      };
      const updatedTicket = applyEvent(params.ticket, event);
      return Activities.log({ scope: 'crm', event, ticketId: params.ticket.id }, user).then(() =>
        persist(updatedTicket),
      );
    },
    updateComment(params, user) {
      const event = {
        type: 'update-comment',
        on: Date.now(),
        by: user.id,
        comment: params.comment,
        newText: params.newText,
      };
      const updatedTicket = applyEvent(params.ticket, event);
      return Activities.log({ scope: 'crm', event, ticketId: params.ticket.id }, user).then(() =>
        persist(updatedTicket),
      );
    },
    closeTicket(params, user) {
      const event = {
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
      };
      const updatedTicket = applyEvent(params.ticket, event);
      return Activities.log({ scope: 'crm', event, ticketId: params.ticket.id }, user).then(() =>
        persist(updatedTicket),
      );
    },
    reopenTicket(params, user) {
      const event = {
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
      };
      const updatedTicket = applyEvent(params.ticket, event);
      return Activities.log({ scope: 'crm', event, ticketId: params.ticket.id }, user).then(() =>
        persist(updatedTicket),
      );
    },
    updateTitle({ ticket, value }, user) {
      const event = {
        type: 'update-title',
        on: Date.now(),
        by: user.id,
        value,
        was: ticket.title,
      };
      const updatedTicket = applyEvent(ticket, event);
      return Activities.log({ scope: 'crm', event, ticketId: ticket.id }, user).then(() => persist(updatedTicket));
    },
    updateDescription({ ticket, value }, user) {
      const event = {
        type: 'update-description',
        on: Date.now(),
        by: user.id,
        value,
        was: ticket.description,
      };
      const updatedTicket = applyEvent(ticket, event);
      return Activities.log({ scope: 'crm', event, ticketId: ticket.id }, user).then(() => persist(updatedTicket));
    },
  };
}
