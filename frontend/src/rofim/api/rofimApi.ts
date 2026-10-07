/* eslint-disable @cspell/spellchecker */
import { getDefaultStore } from 'jotai';
import environment from '../environments';
import { getRofimSession, getRofimSessionToken } from '../utils/session';
import { isSessionInvalidAtom } from '../atoms/sessionAtoms';

export enum WaitingRoomStatus {
  Connected = 'connected', // = Enregistrement
  Disconnected = 'disconnected',
  Wait = 'wait',
  Progress = 'progress', // Visioconference started
  MomentarilyDisconnected = 'momentarily-disconnected',
  CheckingEquipment = 'checking-equipment',
}

export type WaitingRoomStatusResponse = {
  waitingRoomStatus: WaitingRoomStatus;
  doctorDelayInMinute: number;
  startTime: string;
};

const SESSION_REJECTED_STATUSES = [401, 403];

const sessionHeaders = (): HeadersInit => ({
  Authorization: `Bearer ${getRofimSessionToken() ?? ''}`,
});

const handleResponse = (response: Response): Response => {
  if (SESSION_REJECTED_STATUSES.includes(response.status)) {
    getDefaultStore().set(isSessionInvalidAtom, true);
  }
  if (!response.ok) {
    throw new Error(`Erreur API: ${response.status} ${response.statusText}`);
  }
  return response;
};

const updateTeleconsultationStatus = async (
  type: WaitingRoomStatus,
  options?: { keepalive?: boolean }
): Promise<WaitingRoomStatusResponse | null> => {
  const session = getRofimSession();
  const patientId = session?.patientId;
  const sessionId = session?.sessionId;

  const response = await fetch(
    `${environment.apiUrl}/services/visio/session/${sessionId}/waitingRoomStatus/${type}/for/${patientId}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...sessionHeaders() },
      keepalive: options?.keepalive,
    }
  );

  return handleResponse(response).json() as Promise<WaitingRoomStatusResponse | null>;
};

const countParticipants = async (): Promise<number> => {
  const session = getRofimSession();
  const sessionId = session?.sessionId;

  const response = await fetch(
    `${environment.apiUrl}/services/visio/session/${sessionId}/countParticipants`,
    { headers: sessionHeaders() }
  );

  return handleResponse(response).json() as Promise<number>;
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
