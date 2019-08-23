import { useContext, useEffect } from 'react';
import { Machine, assign } from 'xstate';
import { useMachine } from '@xstate/react';
import SessionContext from '../../utils/SessionContext';
import UserContext from '../../utils/UserContext';
import { render } from '../../utils/render-machine';

const machine = Machine({
  id: 'fetch',
  initial: 'idle',
  context: {
    user: null,
  },
  states: {
    idle: {
      on: {
        CONNECT: {
          target: 'connected',
          cond: (context, event) => !!event.user,
          actions: assign({
            user: (context, event) => event.user,
          }),
        },
      },
    },
    connected: {
      on: {
        DISCONNECT: {
          target: 'idle',
          actions: assign({
            user: () => null,
          }),
        },
      },
    },
  },
});

export function Authentication({ children, currentRoute }) {
  const [current, send] = useMachine(machine);
  const session = useContext(SessionContext);

  useEffect(() => {
    return session.listen(({ user }) => {
      if (user) send({ type: 'CONNECT', user });
      else send({ type: 'DISCONNECT' });
    }, currentRoute);
  }, []);

  return (
    <UserContext.Provider value={current.context.user}>
      {render(current, {
        idle: () => (['/login', '_error'].includes(currentRoute) ? children : null),
        connected: () => children,
      })}
    </UserContext.Provider>
  );
}
