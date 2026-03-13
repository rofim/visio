/* eslint-disable @cspell/spellchecker */
import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAtom } from 'jotai';
import { getRofimSession, RofimSession } from '../utils/session';
import environment from '../environments';
import {
  canJoinVisioAtom,
  doctorDelayAtom,
  isSocketConnectedAtom,
  isAppInitAtom,
  tcStartTimeAtom,
} from '../atoms/webSocketAtoms';

let socket: Socket | null = null;

declare global {
  interface Window {
    _paq: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      push: (args: any[]) => void;
    };
  }
}

const sendMatomoReconnectEvent = () => {
  window?._paq.push(['trackEvent', 'Websocket', 'Reconnected', 'TLC Patient - Vonage']);
};
const sendMatomoDisconnectEvent = () => {
  window?._paq.push(['trackEvent', 'Websocket', 'Disconnected', 'TLC Patient - Vonage']);
};

const useWebSocket = (shouldLogToMatomo: boolean = false) => {
  const [isSocketInit, setIsSocketInit] = useState(false);
  const [isSocketConnected, setIsSocketConnected] = useAtom(isSocketConnectedAtom);
  const [, setAppIsInit] = useAtom(isAppInitAtom);
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
    setAppIsInit(true);
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
  const onMessage = (event: any, rofimSesion: RofimSession) => {
    if (event.channel === 'teleconsultation:doctor:add-delay') {
      setDoctorDelayInMinute(event.content.doctorDelayInMinute as number);
      setStartTime(new Date(event.content.startTime as string).getTime());
    }

    if (
      event.channel === 'teleconsultation:doctor:visio-live' &&
      event?.content?.emittingTcId &&
      rofimSesion?.room === `${event.content.emittingTcId}-teleconsultation`
    ) {
      setCanJoinVisio(true);
    }
  };

  const onConnect = () => {
    setConnectionCount((prev) => prev + 1);
    setAppIsInit(true);
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
      setAppIsInit(true);
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
      socket.on('message', (event) => onMessage(event, rofimSession));

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
