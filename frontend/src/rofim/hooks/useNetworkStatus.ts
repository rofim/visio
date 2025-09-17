import { useEffect, useState } from 'react';

const useNetworkStatus = () => {
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);

  useEffect(() => {
    window.addEventListener('online', () => {
      setIsOnline(true);
    });
    window.addEventListener('offline', () => {
      setIsOnline(false);
    });

    return () => {
      window.removeEventListener('online', () => {
        setIsOnline(true);
      });
      window.removeEventListener('offline', () => {
        setIsOnline(false);
      });
    };
  }, []);

  return isOnline;
};

export default useNetworkStatus;
