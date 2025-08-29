import { PropsWithChildren, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAtom } from 'jotai';
import { initRofimSession } from '../utils/session';
import { socketConnectionStatusAtom } from '../atoms/webSocketAtoms';
import useWebSocket from '../hooks/useWebSocket';

const RofimInit = ({ children }: PropsWithChildren) => {
  const [isSocketConnectionReady] = useAtom(socketConnectionStatusAtom);
  const { initSocket, setIsSocketInit } = useWebSocket();
  const [isInit, setIsInit] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    try {
      initRofimSession();
      initSocket();
    } catch (error) {
      console.error('Cannot load rofim session token', error);
      navigate('/error');
    }

    setIsInit(true);
  }, [navigate, initSocket, setIsSocketInit]);

  // To avoid blinking page when no token set
  // and accessing waiting-room page, which start camera
  return isInit && isSocketConnectionReady ? children : null;
};

export default RofimInit;
