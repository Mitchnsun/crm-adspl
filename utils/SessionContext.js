import { createContext } from 'react';
export default createContext({
  login: () => {
    console.log('Login from default SessionContext');
  },
  logout: () => {
    console.log('Logout from default SessionContext');
  },
  isUserAdmin: () => false,
});
