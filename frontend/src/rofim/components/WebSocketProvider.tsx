import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  useMemo,
  useRef,
} from 'react';
import WebSocketService from '../utils/websocket.service';
import { getRofimSession } from '../utils/session';
import { environment } from '../environment';

type WebSocketCallbacks = {
  onDoctorAddDelay?: (event: any) => void;
};

interface WebSocketContextType {
  addCallbacks: (callbacks: WebSocketCallbacks) => void;
  removeCallbacks: () => void;
}

const WebSocketContext = createContext<WebSocketContextType | null>(null);

interface WebSocketProviderProps {
  children: ReactNode;
}

export const WebSocketProvider: React.FC<WebSocketProviderProps> = ({ children }) => {
  const [ws, setWs] = useState<WebSocketService | null>(null);
  const callbacksRef = useRef<WebSocketCallbacks>({});
  const session = getRofimSession();
  const wsRef = useRef<WebSocketService | null>(null);
  const slug = session?.slug;
  const type = session?.type;

  // Fonction pour créer et connecter le WebSocket
  const createWebSocket = (slug: string | null | undefined, type: string) => {
    const websocket = new WebSocketService({
      id: slug || '',
      type: type || '',
    });

    websocket.connect({
      onDoctorAddDelay: (event) => {
        if (callbacksRef.current.onDoctorAddDelay) {
          callbacksRef.current.onDoctorAddDelay(event);
        }
      },
    });
    console.log('connect');

    wsRef.current = websocket;
    setWs(websocket);
  };

  useEffect(() => {
    // Vérifier que la session est bien initialisée
    if (!session) {
      console.error('No session available, skipping WebSocket connection');
      return;
    }

    if (!type) {
      console.error('No type available, skipping WebSocket connection');
      return;
    }

    // Éviter la reconnexion si le WebSocket existe déjà pour le même slug
    if (wsRef.current) {
      console.error('WebSocket already exists, skipping reconnection');
      return;
    }

    createWebSocket(slug, type);

    return () => {
      if (wsRef.current) {
        wsRef.current.disconnect();
        wsRef.current = null;
        setWs(null);
      }
    };
  }, [slug, type]);

  const addCallbacks = (newCallbacks: WebSocketCallbacks) => {
    callbacksRef.current = newCallbacks;
  };

  const removeCallbacks = () => {
    callbacksRef.current = {};
  };

  const contextValue = useMemo(
    () => ({
      addCallbacks,
      removeCallbacks,
    }),
    []
  );

  return <WebSocketContext.Provider value={contextValue}>{children}</WebSocketContext.Provider>;
};

export const useWebSocketContext = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocketContext must be used within a WebSocketProvider');
  }
  return context;
};
