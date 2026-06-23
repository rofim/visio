/* eslint-disable @cspell/spellchecker */
import { MouseEvent, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useNetworkStatus from './useNetworkStatus';
import useWebSocket from './useWebSocket';
import { getRofimSession } from '../utils/session';
import RofimApiService, { WaitingRoomStatus } from '../api/rofimApi';

const useEquipmentsTestRoom = () => {
  const navigate = useNavigate();
  const isOnline = useNetworkStatus();
  const { isSocketConnected } = useWebSocket();
  const [isLoading, setIsLoading] = useState(false);

  const rofimSession = getRofimSession();
  const room = rofimSession?.room;
  const patientId = rofimSession?.patientId;
  const waitingRoom = rofimSession?.waitingRoom;

  useEffect(() => {
    if (patientId && isOnline) {
      // Pour laisser le temps au WS de se reconnecter avant d'appeler l'API
      const timeout = setTimeout(() => {
        void RofimApiService.updateTeleconsultationStatus(WaitingRoomStatus.CheckingEquipment);
      }, 5000);
      return () => timeout && clearTimeout(timeout);
    }
    return () => {};
  }, [patientId, isOnline, isSocketConnected]);

  const handleJoinClick = async (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    if (patientId && waitingRoom) {
      try {
        // Start visio if there is someone in the room (doctor enter first)
        setIsLoading(true);
        const hasParticipantCount = await RofimApiService.countParticipants();
        if (!hasParticipantCount) {
          return navigate('/waiting-room');
        }
      } catch (error) {
        console.error('Error checking participant count:', error);
        return navigate('/waiting-room');
      } finally {
        setIsLoading(false);
      }
    }
    return navigate(`/room/${room}`);
  };

  return { isLoading, patientId, waitingRoom, handleJoinClick };
};

export default useEquipmentsTestRoom;
