import Router from 'next/router';

export default function createDriver() {
  return {
    onConnect: currentRoute => {
      Router.push(currentRoute || '/');
    },
    onDisconnect: () => {
      Router.push('/login');
    },
  };
}
