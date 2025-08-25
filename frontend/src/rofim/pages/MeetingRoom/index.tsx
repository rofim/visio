import ReactDOM from 'react-dom/client';
import { useEffect } from 'react';
import VonageRoom from '../../../pages/MeetingRoom';
import RofimApiService, { WaitingRoomStatus } from '../../api/rofimApi';
import { getRofimSession } from '../../utils/session';
import PictureInPictureButton from '../../components/PictureInPictureButton';
import './room.css';

const Room = () => {
  const patientId = getRofimSession()?.patientId;

  useEffect(() => {
    if (patientId) {
      RofimApiService.updateTeleconsultationStatus(WaitingRoomStatus.Progress);
    }
  }, [patientId]);

  // Inject Picture-in-Picture button when component is mounted
  useEffect(() => {
    const node = document.getElementById('center-toolbar-buttons');
    if (node) {
      const root = ReactDOM.createRoot(node);
      root.render(<PictureInPictureButton className="order-1" />);
    }
  }, []);

  return <VonageRoom />;
};

export default Room;
