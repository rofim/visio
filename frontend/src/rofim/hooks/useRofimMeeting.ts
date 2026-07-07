/* eslint-disable @cspell/spellchecker */
import { useEffect } from 'react';
import RofimApiService, { WaitingRoomStatus } from '../api/rofimApi';
import { getRofimSession } from '../utils/session';
import useWebSocket from './useWebSocket';
import useSessionContext from '../../hooks/useSessionContext';

const useRofimMeeting = () => {
  const rofimSession = getRofimSession();
  const patientId = rofimSession?.patientId;
  const type = rofimSession?.type;
  const { isSocketConnected } = useWebSocket();
  const { subscriberWrappers } = useSessionContext();

  useEffect(() => {
    if (type === 'teleconsultation') {
      if (patientId) {
        // TODO: a refacto quand on aura plus vonageV1
        // Pour laisser le temps au WS de se reconnecter avant d'appeler l'API
        const timeout = setTimeout(() => {
          void RofimApiService.updateTeleconsultationStatus(WaitingRoomStatus.Progress);
        }, 5000);
        return () => clearTimeout(timeout);
      }

      if (subscriberWrappers.length === 0) {
        // this is for the doctor
        void RofimApiService.doctorJoinVisio();
        // periodically try to join the visio in case of disconnection
        const interval = setInterval(() => {
          void RofimApiService.doctorJoinVisio();
        }, 15000);

        return () => clearInterval(interval);
      }
    }
    return () => {};
  }, [patientId, type, isSocketConnected, subscriberWrappers.length]);
};

export default useRofimMeeting;
