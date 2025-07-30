import { environment } from '../environment';
import { getRofimSession } from './session';

export enum WaitingRoomStatus {
  Connected = 'connected', // = Enregistrement
  Disconnected = 'disconnected',
  Wait = 'wait',
  Progress = 'progress', // Visioconference started
  MomentarilyDisconnected = 'momentarily-disconnected',
  CheckingEquipment = 'checking-equipment',
}

class RofimApiService {
  /**
   * Update the teleconsultation status
   * @param type - The new status
   * @returns Promise<Response> - The response from the API
   */
  async updateTeleconsultationStatus(type: WaitingRoomStatus): Promise<Response> {
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

    return response;
  }
}

export default new RofimApiService();
