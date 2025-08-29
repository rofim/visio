import { useEffect } from 'react';
import VonageRoom from '../../../pages/MeetingRoom';
import RofimApiService, { WaitingRoomStatus } from '../../api/rofimApi';
import { getRofimSession } from '../../utils/session';
import './room.css';

const Room = () => {
  const rofimSession = getRofimSession();
  const patientId = rofimSession?.patientId;
  const type = rofimSession?.type;

  useEffect(() => {
    if (type === 'teleconsultation') {
      if (patientId) {
        RofimApiService.updateTeleconsultationStatus(WaitingRoomStatus.Progress);
      } else {
        // this is for the doctor
        RofimApiService.doctorJoinVisio();
      }
    }
  }, [patientId, type]);

  return <VonageRoom />;
};

export default Room;
