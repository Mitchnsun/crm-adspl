import createAgent from './Agent';

export default function createAgents(drivers) {
  const dbAgents = drivers.db('agents');
  const agents = drivers.createListener([], 'createAdmin');

  return {
    fetch() {
      dbAgents
        .getAll()
        .then(r => r.map(createAgent))
        .then(a => agents.replace(a));
    },
    getObservable() {
      return agents;
    },
    get(id) {
      return dbAgents.get(id).then(r => createAgent(r));
    },
    enable(agent) {
      return dbAgents
        .update(agent, { field: 'isActive', value: true, was: agent.isActive })
        .then(a => agents.replace(a));
    },
    disable(agent) {
      return dbAgents
        .update(agent, { field: 'isActive', value: false, was: agent.isActive })
        .then(a => agents.replace(a));
    },
    groupByStatus: data =>
      data.reduce(
        (r, agent) => {
          if (agent.isActive) r.actives.push(agent);
          else r.inactives.push(agent);
          return r;
        },
        { actives: [], inactives: [] },
      ),
  };
}
