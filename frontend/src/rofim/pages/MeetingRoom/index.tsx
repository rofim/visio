import { useEffect } from 'react';
import VonageRoom from '../../../pages/MeetingRoom';
import RofimApiService, { WaitingRoomStatus } from '../../api/rofimApi';
import { getRofimSession } from '../../utils/session';
import './room.css';

const Room = () => {
  const patientId = getRofimSession()?.patientId;

  useEffect(() => {
    if (patientId) {
      RofimApiService.updateTeleconsultationStatus(WaitingRoomStatus.Progress);
    }
  }, [patientId]);

  return <VonageRoom />;
};

export default Room;
