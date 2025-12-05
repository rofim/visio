import { useEffect } from 'react';
import VonageRoom from '../../../pages/MeetingRoom';
import RofimApiService, { WaitingRoomStatus } from '../../api/rofimApi';
import { getRofimSession } from '../../utils/session';
import './room.css';
import useWebSocket from '../../hooks/useWebSocket';

const Room = () => {
  const rofimSession = getRofimSession();
  const patientId = rofimSession?.patientId;
  const type = rofimSession?.type;
  const { isSocketConnected } = useWebSocket();

  useEffect(() => {
    if (type === 'teleconsultation') {
      if (patientId) {
        RofimApiService.updateTeleconsultationStatus(WaitingRoomStatus.Progress);
      } else {
        // this is for the doctor
        RofimApiService.doctorJoinVisio();
      }
    }
  }, [patientId, type, isSocketConnected]);

  return <VonageRoom />;
};

export default Room;
