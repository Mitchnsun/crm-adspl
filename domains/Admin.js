import createUsers from './Users';

export default function createAdmin(drivers) {
  return user => {
    return {
      ...user,
      users: createUsers(drivers),
    };
  };
}
