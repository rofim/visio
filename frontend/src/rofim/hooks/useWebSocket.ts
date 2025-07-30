import { useEffect, useCallback } from 'react';
import WebSocketService from '../utils/websocket.service';
import { getRofimSession } from '../utils/session';

type WebSocketCallbacks = {
  onDoctorAddDelay?: (event: any) => void;
};

// Variable globale pour stocker l'instance WebSocket
let globalWebSocket: WebSocketService | null = null;
let globalCallbacks: WebSocketCallbacks = {};

const useWebSocket = (callbacks: WebSocketCallbacks = {}) => {
  const session = getRofimSession();
  const slug = session?.slug;
  const type = session?.type;

  // Fonction pour mettre à jour les callbacks globaux
  const updateCallbacks = useCallback((newCallbacks: WebSocketCallbacks) => {
    globalCallbacks = { ...globalCallbacks, ...newCallbacks };
  }, []);

  useEffect(() => {
    if (!type) {
      return;
    }

    if (!globalWebSocket) {
      globalWebSocket = new WebSocketService({ id: slug || '', type });

      globalWebSocket.connect({
        onDoctorAddDelay: (event) => {
          if (globalCallbacks.onDoctorAddDelay) {
            globalCallbacks.onDoctorAddDelay(event);
          }
        },
      });
    }

    // Mettre à jour les callbacks avec ceux du composant actuel
    updateCallbacks(callbacks);

    return () => {
      // On ne déconnecte pas ici pour permettre la réutilisation
      // La déconnexion se fera au niveau de l'application
    };
  }, [type, callbacks, updateCallbacks]);

  // Fonction pour déconnecter manuellement si nécessaire
  const disconnect = useCallback(() => {
    if (globalWebSocket) {
      globalWebSocket.disconnect();
      globalWebSocket = null;
      globalCallbacks = {};
    }
  }, []);

  return { disconnect };
};

export default useWebSocket;
