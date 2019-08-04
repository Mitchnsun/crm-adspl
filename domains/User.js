export default function createUser(drivers) {
  return user => {
    return {
      ...user,
      isAdmin: () => user.role === 'admin',
    };
  };
}
