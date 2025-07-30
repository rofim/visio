import { ReactElement, useEffect, useState } from 'react';
import { getRofimSession } from '../utils/session';
import WarningIcon from '@mui/icons-material/Warning';
import { getShortTimeStringFromDate } from '../utils/date.service';
import useSessionContext from '../../hooks/useSessionContext';
import { useNavigate } from 'react-router-dom';
import rofimApiService, { WaitingRoomStatus } from '../utils/rofimApi.service';
import { useWebSocketContext } from '../components/WebSocketProvider';

/**
 * WaitingDoctor Component
 *
 * This component renders a waiting doctor page to inform the patient that the doctor is on the way.
 * @returns {ReactElement} - The waiting doctor page.
 */
const WaitingDoctor = (): ReactElement => {
  const navigate = useNavigate();
  const [showDoctorDelay, setShowDoctorDelay] = useState(false);
  const [doctorDelayInMinute, setDoctorDelayInMinute] = useState<number>(0);
  const [startTime, setStartTime] = useState<string>('');
  const { subscriberWrappers, joinRoom } = useSessionContext();
  const { addCallbacks, removeCallbacks } = useWebSocketContext();
  const session = getRofimSession();
  const room = session?.room;
  const patientId = session?.patientId;
  const participantCount = subscriberWrappers.length;
  const hasParticipants = participantCount > 0;

  useEffect(() => {
    // Je dois joinRoom pour pouvoir avoir le useSessionContext partagé entre mes composants
    if (joinRoom && room) {
      joinRoom(room);
    }

    if (patientId) {
      rofimApiService.updateTeleconsultationStatus(WaitingRoomStatus.Wait);
    }
  }, [patientId]);

  // Redirection réactive vers la room dès qu'un participant rejoint (le docteur est le premier participant)
  useEffect(() => {
    if (hasParticipants && room) {
      navigate(`/room/${room}`, {
        state: {
          hasAccess: true,
        },
      });
    }
  }, [hasParticipants, room]);

  // Ajouter les callbacks pour gérer les événements de retard du médecin
  useEffect(() => {
    addCallbacks({
      onDoctorAddDelay: (event: any) => {
        setDoctorDelayInMinute(event.data.doctorDelayInMinute);
        setStartTime(event.data.startTime);
        setShowDoctorDelay(true);
      },
    });

    return () => {
      removeCallbacks();
    };
  }, [addCallbacks, removeCallbacks]);

  return (
    <div className="flex size-full flex-col bg-[#F5F6F8]" data-testid="waitingDoctor">
      <div className="flex w-full flex-col items-center justify-center min-h-screen p-4">
        {/* Main title */}
        <h1 className="text-[32px] font-bold text-black mb-8 text-center">Veuillez patienter</h1>

        {/* White card container */}
        <div className="bg-white rounded-lg shadow-sm p-14 max-w-4xl w-full">
          {/* Delay added by doctor */}
          {showDoctorDelay && (
            <div className="bg-[#FEFCE8] border-[#FEF08A] border shadow-md p-4 rounded flex items-start mb-4">
              <div className="flex-1">
                <div className="flex items-start gap-2">
                  <WarningIcon sx={{ color: '#CA8A04', fontSize: 20 }} />
                  <strong>Rendez-vous retardé</strong>
                </div>
                <div className="flex flex-col items-start mt-2">
                  <p>
                    Votre médecin vous informe que le rendez-vous est retardé de{' '}
                    <b>{doctorDelayInMinute} min</b> (heure estimée :{' '}
                    <b>{getShortTimeStringFromDate(startTime)}</b>)
                  </p>
                </div>
              </div>
            </div>
          )}
          <div className="flex flex-col items-center space-y-6">
            {/* Doctor illustration */}
            <img src="public/images/medecin.png" alt="Médecin" className="w-[120px] h-[120px]" />

            {/* Main message */}
            <h2 className="text-2xl font-bold text-primary text-center">
              Votre médecin va bientôt arriver
            </h2>

            {/* Instructional text */}
            <div className="text-center space-y-3">
              <p className="text-grey-b text-xl leading-relaxed">
                Vous serez automatiquement redirigé vers la visioconférence dès qu'il se connectera.
              </p>
              <p className="text-grey-b text-xl leading-relaxed">
                Merci de rester connecté et de garder cette fenêtre ouverte.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WaitingDoctor;
