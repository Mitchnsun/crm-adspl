import createAgents from './Agents';

export default function createAdmin(drivers) {
  return user => {
    return {
      ...user,
      agents: createAgents(drivers),
    };
  };
}
