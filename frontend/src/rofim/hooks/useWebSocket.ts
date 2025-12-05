/* eslint-disable no-underscore-dangle */
/* eslint-disable @cspell/spellchecker */
import { useEffect, useState } from 'react';
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

const sendMatomoReconnectEvent = () => {
  window?._paq.push(['trackEvent', 'Websocket', 'Reconnected', 'TLC Patient - Vonage']);
};
const sendMatomoDisconnectEvent = () => {
  window?._paq.push(['trackEvent', 'Websocket', 'Disconnected', 'TLC Patient - Vonage']);
};

const useWebSocket = (shouldLogToMatomo: boolean = false) => {
  const [isSocketInit, setIsSocketInit] = useState(false);
  const [isSocketConnected, setIsSocketConnected] = useAtom(isSocketConnectedAtom);
  const [, setSocketConnectionReady] = useAtom(socketConnectionStatusAtom);
  const [, setDoctorDelayInMinute] = useAtom(doctorDelayAtom);
  const [, setStartTime] = useAtom(tcStartTimeAtom);
  const [, setCanJoinVisio] = useAtom(canJoinVisioAtom);
  const [connectionCount, setConnectionCount] = useState(0);

  useEffect(() => {
    if (shouldLogToMatomo && connectionCount > 1) {
      sendMatomoReconnectEvent();
    }
  }, [connectionCount, shouldLogToMatomo]);

  const onConnectionError = (error: Error) => {
    console.error('Socket.IO connection error:', error);
    setSocketConnectionReady(true);
    setConnectionCount((prev) => {
      if (prev === 0) {
        // Si jamais la première connection échoue
        sendMatomoDisconnectEvent();
        return 1;
      }
      return prev;
    });
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
    setConnectionCount((prev) => prev + 1);
    setSocketConnectionReady(true);
    setIsSocketConnected(true);
  };

  const onDisconnect = () => {
    if (shouldLogToMatomo) {
      sendMatomoDisconnectEvent();
    }
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
