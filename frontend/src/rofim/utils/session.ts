import { jwtDecode } from 'jwt-decode';
import { getStorageItem, resetStorage, setStorageItem, STORAGE_KEYS } from '../../utils/storage';

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
    type: string;
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
    window.history.replaceState(
      {},
      document.title,
      window.location.href.replace(window.location.search, '')
    );
    const rofimSession = parseSession(token);
    if (rofimSession?.username) {
      setStorageItem(STORAGE_KEYS.USERNAME, rofimSession.username);
    }
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

export const getRofimSession = () => {
  const token = getStorageItem('token');
  const patientId = getStorageItem('patientId') || null;
  const slug = getStorageItem('slug') || null;
  const waitingRoom = getStorageItem('waitingRoom') === 'true';
  const parsedSession = parseSession(token);
  return parsedSession
    ? {
        ...parsedSession,
        patientId,
        slug,
        waitingRoom,
      }
    : null;
};
