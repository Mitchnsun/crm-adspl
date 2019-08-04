export default function createTickets(drivers) {
  const dbTickets = drivers.dbList('tickets');

  return {
    defaultValue: [],
    new: () => {
      const tickets = drivers.createListener([]);
      return {
        getObservable: () => tickets,
        fetch: async config => {
          const all = await dbTickets.getAll(config);
          tickets.replace(all || []);
          return all || [];
        },
        fetchMore: async (config = {}) => {
          const values = tickets.currentValue();
          const all = await dbTickets.getAll({
            startAfter: values.length > 0 ? values[values.length - 1] : null,
            ...config,
          });
          tickets.updateWithMore(all || []);
          return all || [];
        },
      };
    },
  };
}
