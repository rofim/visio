/* eslint-disable @cspell/spellchecker */
import environment from '../environments';
import { getRofimSession } from '../utils/session';

export enum WaitingRoomStatus {
  Connected = 'connected', // = Enregistrement
  Disconnected = 'disconnected',
  Wait = 'wait',
  Progress = 'progress', // Visioconference started
  MomentarilyDisconnected = 'momentarily-disconnected',
  CheckingEquipment = 'checking-equipment',
}

const updateTeleconsultationStatus = async (type: WaitingRoomStatus) => {
  const session = getRofimSession();
  const patientId = session?.patientId;
  const sessionId = session?.sessionId;

  const response = await fetch(
    `${environment.apiUrl}/services/visio/session/${sessionId}/waitingRoomStatus/${type}/for/${patientId}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    }
  );

  if (!response.ok) {
    throw new Error(`Erreur API: ${response.status} ${response.statusText}`);
  }

  return response.json();
};

const countParticipants = async (): Promise<number> => {
  const session = getRofimSession();
  const sessionId = session?.sessionId;

  const response = await fetch(
    `${environment.apiUrl}/services/visio/session/${sessionId}/countParticipants`
  );
  if (!response.ok) {
    throw new Error(`Erreur API: ${response.status} ${response.statusText}`);
  }

  return response.json();
};

const doctorJoinVisio = async () => {
  const session = getRofimSession();
  const slug = session?.slug;
  const authorizationHeader = session?.authorizationHeader;

  if (!authorizationHeader) {
    throw new Error('authorizationHeader missing');
  }
  const response = await fetch(
    `${environment.apiUrl}/services/teleconsultation/${slug}/doctor-hook?type=live`,
    {
      method: 'post',
      headers: {
        Authorization: authorizationHeader,
      },
    }
  );
  if (!response.ok) {
    throw new Error(`Erreur API: ${response.status} ${response.statusText}`);
  }
};

export default {
  updateTeleconsultationStatus,
  countParticipants,
  doctorJoinVisio,
};
