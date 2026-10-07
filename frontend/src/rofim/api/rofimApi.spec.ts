import { afterEach, beforeEach, describe, expect, it, vi, Mock } from 'vitest';
import { getDefaultStore } from 'jotai';
import rofimApiService, { WaitingRoomStatus } from './rofimApi';
import { ActType, getRofimSession, getRofimSessionToken } from '../utils/session';
import { isSessionInvalidAtom } from '../atoms/sessionAtoms';

vi.mock('../utils/session', async () => {
  const actual = await vi.importActual<typeof import('../utils/session')>('../utils/session');
  return {
    ...actual,
    getRofimSession: vi.fn(),
    getRofimSessionToken: vi.fn(),
  };
});

const fetchMock = vi.fn();

const baseSession = {
  username: 'John Doe',
  room: 'room-1',
  token: 'vonage-token',
  authorizationHeader: 'Bearer doctor-token',
  sessionId: 'session-1',
  type: ActType.TC,
  patientId: 'patient-1',
  waitingRoom: true,
};

const jsonResponse = (status: number, body: unknown) =>
  ({
    ok: status >= 200 && status < 300,
    status,
    statusText: `status ${status}`,
    json: () => Promise.resolve(body),
  }) as unknown as Response;

describe('rofimApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal('fetch', fetchMock);
    getDefaultStore().set(isSessionInvalidAtom, false);
    (getRofimSession as Mock).mockReturnValue(baseSession);
    (getRofimSessionToken as Mock).mockReturnValue('raw.session.jwt');
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe('updateTeleconsultationStatus', () => {
    it('sends the raw Rofim session token as bearer and keeps the keepalive option', async () => {
      fetchMock.mockResolvedValue(
        jsonResponse(200, {
          waitingRoomStatus: WaitingRoomStatus.Wait,
          doctorDelayInMinute: 5,
          startTime: '2026-10-07T10:00:00.000Z',
        })
      );

      const result = await rofimApiService.updateTeleconsultationStatus(WaitingRoomStatus.Wait, {
        keepalive: true,
      });

      expect(fetchMock).toHaveBeenCalledTimes(1);
      const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
      expect(url).toContain(
        '/services/visio/session/session-1/waitingRoomStatus/wait/for/patient-1'
      );
      expect(init.method).toBe('POST');
      expect(init.keepalive).toBe(true);
      expect(init.headers).toMatchObject({ Authorization: 'Bearer raw.session.jwt' });
      expect(result).toEqual({
        waitingRoomStatus: WaitingRoomStatus.Wait,
        doctorDelayInMinute: 5,
        startTime: '2026-10-07T10:00:00.000Z',
      });
      expect(getDefaultStore().get(isSessionInvalidAtom)).toBe(false);
    });

    it.each([401, 403])(
      'flags the session as invalid and throws on a %i response',
      async (status) => {
        fetchMock.mockResolvedValue(jsonResponse(status, { error: 'rejected' }));

        await expect(
          rofimApiService.updateTeleconsultationStatus(WaitingRoomStatus.Wait)
        ).rejects.toThrow(String(status));

        expect(getDefaultStore().get(isSessionInvalidAtom)).toBe(true);
      }
    );

    it('throws without flagging the session on another error', async () => {
      fetchMock.mockResolvedValue(jsonResponse(500, {}));

      await expect(
        rofimApiService.updateTeleconsultationStatus(WaitingRoomStatus.Wait)
      ).rejects.toThrow('500');

      expect(getDefaultStore().get(isSessionInvalidAtom)).toBe(false);
    });
  });

  describe('countParticipants', () => {
    it('sends the raw Rofim session token as bearer and returns the count', async () => {
      fetchMock.mockResolvedValue(jsonResponse(200, 2));

      const count = await rofimApiService.countParticipants();

      const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
      expect(url).toContain('/services/visio/session/session-1/countParticipants');
      expect(init.headers).toMatchObject({ Authorization: 'Bearer raw.session.jwt' });
      expect(count).toBe(2);
    });

    it('flags the session as invalid and throws on a 401 response', async () => {
      fetchMock.mockResolvedValue(jsonResponse(401, {}));

      await expect(rofimApiService.countParticipants()).rejects.toThrow('401');

      expect(getDefaultStore().get(isSessionInvalidAtom)).toBe(true);
    });
  });
});
