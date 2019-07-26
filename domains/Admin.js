export default function createAdmin(drivers) {
  return {
    getUsers() {
      return Promise.resolve([]);
    },
    addUser({ firstname, lastname }) {},
    getUser(id) {
      return Promise.reject(new Error('No found!'));
    },
    removeUser(id) {},
  };
}
