import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { getRofimSession } from '../utils/session';
import environment from '../environments';

const useWebSocket = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [showDoctorDelay, setShowDoctorDelay] = useState(false);
  const [doctorDelayInMinute, setDoctorDelayInMinute] = useState<number>(0);
  const [startTime, setStartTime] = useState<string>('');

  const onConnectionError = (error: Error) => {
    console.error('Socket.IO connection error:', error);
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onMessage = (event: any) => {
    if (event.channel === 'teleconsultation:doctor:add-delay') {
      setDoctorDelayInMinute(event.data.doctorDelayInMinute);
      setStartTime(event.data.startTime);
      setShowDoctorDelay(true);
    }
  };

  const onConnect = () => {
    setIsConnected(true);
  };

  useEffect(() => {
    let socket: Socket | null = null;
    const rofimSession = getRofimSession();

    if (!isConnected && rofimSession?.slug && rofimSession.type) {
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
      socket.on('connect_error', onConnectionError);
      socket.on('message', onMessage);
      socket.connect();
    }

    return () => {
      socket?.off('connect', onConnect);
      socket?.off('connect_error', onConnectionError);
      socket?.off('message', onMessage);
    };
  }, [isConnected]);

  return {
    isConnected,
    showDoctorDelay,
    doctorDelayInMinute,
    startTime,
  };
};

export default useWebSocket;
