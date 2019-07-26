import Router from 'next/router';

export default function createDriver() {
  return {
    onConnect: () => Router.push('/dashboard'),
    onDisconnect: () => {
      console.log('onDisconnect');
      Router.push('/login');
    },
  };
}
