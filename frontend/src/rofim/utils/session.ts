import { jwtDecode } from 'jwt-decode';
import { getStorageItem, resetStorage, setStorageItem } from '../../utils/storage';

export enum ActType {
  TC = 'teleconsultation',
  TCA = 'tca',
  RCP = 'rcp',
  OTHER = 'other',
}

export type RofimSession = {
  username: string;
  room: string;
  token: string;
  authorizationHeader: string;
  sessionId: string;
  type: ActType;
  slug?: string;
  patientId?: string;
  waitingRoom: boolean;
};

const parseSession = (rawJwt: string | null) => {
  if (!rawJwt) {
    return null;
  }

  return jwtDecode<{
    username: string;
    room: string;
    token: string;
    authorizationHeader: string;
    sessionId: string;
    slug: string;
    type: ActType;
  }>(rawJwt);
};

export const initRofimSession = () => {
  const queryParams = new URLSearchParams(window.location.search);
  const token = queryParams.get('t');
  const patientId = queryParams.get('patientId');
  const slug = queryParams.get('slug');
  const language = queryParams.get('lng');
  const waitingRoomFlag = queryParams.get('waitingRoom');

  if (!token && !getStorageItem('token')) {
    throw new Error('Missing Rofim Session Token');
  }

  if (token) {
    // If we get a token in queryParams, it means it's a new session, clean storage to rebuild it
    // keep previous storage when user refresh the page
    resetStorage();
    setStorageItem('token', token);
    // Remove queryParams from URL
    window.history.replaceState(
      {},
      document.title,
      window.location.href.replace(window.location.search, '')
    );
  }

  if (patientId) {
    setStorageItem('patientId', patientId);
  }

  if (slug) {
    setStorageItem('slug', slug);
  }

  if (language) {
    setStorageItem('i18nextLng', language);
  }

  if (waitingRoomFlag) {
    setStorageItem('waitingRoom', waitingRoomFlag);
  }
};

export const getRofimSessionToken = (): string | null => getStorageItem('token');

export const getRofimSession = (): RofimSession | null => {
  const token = getRofimSessionToken();
  const patientId = getStorageItem('patientId') || undefined;
  const slug = getStorageItem('slug') || undefined;
  const waitingRoom = getStorageItem('waitingRoom') === 'true';
  const parsedSession = parseSession(token);
  const type = parsedSession?.type || ActType.OTHER;

  return parsedSession
    ? {
        ...parsedSession,
        type,
        patientId,
        slug,
        waitingRoom,
      }
    : null;
};
