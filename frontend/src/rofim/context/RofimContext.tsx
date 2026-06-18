import { PropsWithChildren, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAtom } from 'jotai';
import { initRofimSession } from '../utils/session';
import { isAppInitAtom } from '../atoms/webSocketAtoms';
import useWebSocket from '../hooks/useWebSocket';
// import useUserContext from '@hooks/useUserContext';
// import { setStorageItem, STORAGE_KEYS } from '@utils/storage';

const RofimInit = ({ children }: PropsWithChildren) => {
  // const { setUser } = useUserContext();
  const [isAppInit] = useAtom(isAppInitAtom);
  const { initSocket } = useWebSocket(true);
  const [isContextInit, setIsContextInit] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    try {
      initRofimSession();
      initSocket();
    } catch (error) {
      console.error('Cannot load rofim session token', error);
      navigate('/error');
    }

    // const rofimSession = getRofimSession();
    // if (rofimSession?.username) {
    //   setUser((prevUser) => ({
    //     ...prevUser,
    //     defaultSettings: {
    //       ...prevUser.defaultSettings,
    //       name: rofimSession.username,
    //     },
    //   }));

    //   setStorageItem(STORAGE_KEYS.USERNAME, rofimSession.username);
    // }

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsContextInit(true);
  }, [navigate, initSocket]);

  // To avoid blinking page when no token set
  // and accessing waiting-room page, which start camera
  return isContextInit && isAppInit ? children : null;
};

export default RofimInit;
