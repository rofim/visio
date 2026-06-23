/* eslint-disable @cspell/spellchecker */
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAtom } from 'jotai';
import { getRofimSession } from '../utils/session';
import rofimApiService, { WaitingRoomStatus } from '../api/rofimApi';
import { canJoinVisioAtom, doctorDelayAtom, tcStartTimeAtom } from '../atoms/webSocketAtoms';
import useWebSocket from './useWebSocket';
import useNetworkStatus from './useNetworkStatus';

const useWaitingDoctor = () => {
  const navigate = useNavigate();
  const [doctorDelayInMinute, setDoctorDelayInMinute] = useAtom(doctorDelayAtom);
  const [startTime, setStartTime] = useAtom(tcStartTimeAtom);
  const [canJoinVisio] = useAtom(canJoinVisioAtom);
  const { isSocketConnected } = useWebSocket();
  const isOnline = useNetworkStatus();
  const alertConnectionLost = !isOnline || !isSocketConnected;

  const session = getRofimSession();
  const room = session?.room;
  const patientId = session?.patientId;
  const waitingRoom = session?.waitingRoom;

  useEffect(() => {
    if (patientId && waitingRoom && isOnline) {
      const updateTCStatus = async () => {
        const tc = await rofimApiService.updateTeleconsultationStatus(WaitingRoomStatus.Wait);
        if (tc.doctorDelayInMinute && tc.startTime) {
          setDoctorDelayInMinute(tc.doctorDelayInMinute as number);
          setStartTime(new Date(tc.startTime as string).getTime());
        }

        // Redirection vers la room s'il y a déjà un participant (le docteur est le premier participant)
        const hasParticipantCount = await rofimApiService.countParticipants();
        if (hasParticipantCount) {
          navigate(`/room/${room}`);
        }
      };
      // TODO: a refacto quand on aura plus vonageV1
      // Pour laisser le temps au WS de se reconnecter avant d'appeler l'API
      const timeout = setTimeout(() => {
        updateTCStatus().catch((error) => console.error('Error updating TC status:', error));
      }, 5000);
      return () => clearTimeout(timeout);
    }
    return () => {};
  }, [
    waitingRoom,
    patientId,
    setDoctorDelayInMinute,
    setStartTime,
    room,
    navigate,
    isOnline,
    isSocketConnected,
  ]);

  useEffect(() => {
    if (canJoinVisio || !waitingRoom) {
      navigate(`/room/${room}`);
    }
  }, [canJoinVisio, waitingRoom, room, navigate]);

  return { alertConnectionLost, doctorDelayInMinute, startTime };
};

export default useWaitingDoctor;
