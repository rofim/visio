import { PropsWithChildren, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAtom } from 'jotai';
import { initRofimSession, getRofimSession, ActType } from '../utils/session';
import { isAppInitAtom } from '../atoms/webSocketAtoms';
import { isSessionInvalidAtom } from '../atoms/sessionAtoms';
import useWebSocket from '../hooks/useWebSocket';
import useMatomo from '../hooks/useMatomo';
import useUserContext from '@hooks/useUserContext';
import { setStorageItem, STORAGE_KEYS } from '@utils/storage';
import RofimApiService, { WaitingRoomStatus } from '../api/rofimApi';
import SessionExpired from '../pages/SessionExpired';

const RofimInit = ({ children }: PropsWithChildren) => {
  const [isSessionReady, setIsSessionReady] = useState(false);
  const [isAppInit] = useAtom(isAppInitAtom);
  const [isSessionInvalid] = useAtom(isSessionInvalidAtom);
  const { initSocket } = useWebSocket(true);
  const { setUser } = useUserContext();
  const navigate = useNavigate();

  // Step 1 — Parse URL params, save to localStorage, build session object
  useEffect(() => {
    try {
      initRofimSession();

      const rofimSession = getRofimSession();
      if (rofimSession?.username) {
        // Sync the session username into the app-level user context
        setUser((prevUser) => ({
          ...prevUser,
          defaultSettings: {
            ...prevUser.defaultSettings,
            name: rofimSession.username,
          },
        }));
        setStorageItem(STORAGE_KEYS.USERNAME, rofimSession.username);
      }
    } catch (error) {
      console.error('Cannot load rofim session token', error);
      navigate('/error');
      return;
    }
    setIsSessionReady(true);
    // setUser is a context setter — stable across renders, intentionally omitted from deps
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);

  // Step 2 — Init WebSocket (patients with waitingRoom only); sets isAppInitAtom on connect or bypass
  useEffect(() => {
    if (isSessionReady) {
      initSocket();
    }
  }, [isSessionReady, initSocket]);

  // Step 3 — Init Matomo once isAppInitAtom is true (fired by step 2)
  useMatomo();

  // Step 4 — Once the app is init, notify the backend right before the app closes for TCA
  useEffect(() => {
    if (!isAppInit) {
      return () => {};
    }

    const rofimSession = getRofimSession();
    const actType = rofimSession?.type;
    if (actType !== ActType.TCA) {
      return () => {};
    }

    const handleBeforeUnload = () => {
      void RofimApiService.updateTeleconsultationStatus(WaitingRoomStatus.Disconnected, {
        keepalive: true,
      });
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isAppInit]);

  // Rendering this page instead of the children also unmounts every hook that would retry the call
  if (isSessionInvalid) {
    return <SessionExpired />;
  }

  // Avoid rendering until session is parsed and socket handshake is done (or bypassed)
  return isSessionReady && isAppInit ? children : null;
};

export default RofimInit;
