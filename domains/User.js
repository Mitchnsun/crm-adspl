export default function createUser(drivers) {
  return (user, _authUser) => {
    return {
      ...user,
      isAdmin: () => user.role === 'admin',
      _authUser,
    };
  };
}
