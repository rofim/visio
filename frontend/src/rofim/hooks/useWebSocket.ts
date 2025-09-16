import { useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAtom } from 'jotai';
import { getRofimSession } from '../utils/session';
import environment from '../environments';
import {
  canJoinVisioAtom,
  doctorDelayAtom,
  isSocketConnectedAtom,
  socketConnectionStatusAtom,
  tcStartTimeAtom,
} from '../atoms/webSocketAtoms';

let socket: Socket | null = null;

const useWebSocket = () => {
  const [isSocketInit, setIsSocketInit] = useState(false);
  const [isSocketConnected, setIsSocketConnected] = useAtom(isSocketConnectedAtom);
  const [, setSocketConnectionReady] = useAtom(socketConnectionStatusAtom);
  const [, setDoctorDelayInMinute] = useAtom(doctorDelayAtom);
  const [, setStartTime] = useAtom(tcStartTimeAtom);
  const [, setCanJoinVisio] = useAtom(canJoinVisioAtom);

  const onConnectionError = (error: Error) => {
    console.error('Socket.IO connection error:', error);
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onMessage = (event: any) => {
    if (event.channel === 'teleconsultation:doctor:add-delay') {
      setDoctorDelayInMinute(event.content.doctorDelayInMinute);
      setStartTime(new Date(event.content.startTime).getTime());
    }

    if (event.channel === 'teleconsultation:doctor:visio-live') {
      setCanJoinVisio(true);
    }
  };

  const onConnect = () => {
    setSocketConnectionReady(true);
    setIsSocketConnected(true);
  };

  const onDisconnect = () => {
    setIsSocketConnected(false);
  };

  const initSocket = () => {
    // Init socket only for TC patient with waitingRoom active
    const rofimSession = getRofimSession();

    const shouldInitSocket =
      rofimSession?.patientId &&
      rofimSession.waitingRoom &&
      rofimSession?.type === 'teleconsultation';

    // bypass socket connection
    if (!shouldInitSocket) {
      setSocketConnectionReady(true);
      return;
    }

    if (!isSocketInit && rofimSession?.slug && rofimSession.type) {
      socket = io(environment.wsUrl, {
        path: '/ws',
        transports: ['websocket', 'polling'],
        autoConnect: false,
        query: {
          id: rofimSession.slug,
          type: rofimSession.type,
        },
      });

      socket.on('connect', onConnect);
      socket.on('disconnect', onDisconnect);
      socket.on('connect_error', onConnectionError);
      socket.on('message', onMessage);

      socket.connect();

      setIsSocketInit(true);
    }
  };

  return {
    initSocket,
    isSocketConnected,
  };
};

export default useWebSocket;
