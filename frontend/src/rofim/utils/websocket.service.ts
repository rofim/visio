import { io, Socket } from 'socket.io-client';
import { environment } from '../environment';

type WebSocketEvent = {
  type: string;
  data?: any;
};

type WebSocketCallbacks = {
  onDoctorAddDelay?: (event: WebSocketEvent) => void;
};

class WebSocketService {
  private socket: Socket | null = null;
  private callbacks: WebSocketCallbacks = {};

  constructor(private readonly query: Record<string, string>) {}

  connect(callbacks: WebSocketCallbacks = {}) {
    this.callbacks = callbacks;

    this.socket = io(environment.wsUrl, {
      path: '/ws',
      transports: ['websocket', 'polling'],
      autoConnect: true,
      query: this.query,
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket.IO connection error:', error);
    });

    this.socket.on('message', (event) => {
      if (event.channel === 'teleconsultation:doctor:add-delay') {
        this.callbacks.onDoctorAddDelay?.({
          type: 'teleconsultation:doctor:add-delay',
          data: event.content,
        });
      }
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  send(eventName: string, data?: any) {
    if (this.socket?.connected) {
      this.socket.emit(eventName, data);
    }
  }

  emit(eventName: string, data?: any) {
    this.send(eventName, data);
  }
}

export default WebSocketService;
