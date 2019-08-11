import Router from 'next/router';

export default function createDriver() {
  return {
    onConnect: () => {
      if (process.browser) {
        Router.push('/');
      }
    },
    onDisconnect: () => {
      if (process.browser) {
        Router.push('/login');
      }
    },
  };
}
