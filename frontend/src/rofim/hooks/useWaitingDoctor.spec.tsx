import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi, Mock } from 'vitest';
import { createStore, Provider } from 'jotai';
import { useNavigate } from 'react-router-dom';
import useWaitingDoctor from './useWaitingDoctor';
import useWebSocket from './useWebSocket';
import useNetworkStatus from './useNetworkStatus';
import { ActType, getRofimSession } from '../utils/session';
import rofimApiService, { WaitingRoomStatus } from '../api/rofimApi';
import { canJoinVisioAtom, doctorDelayAtom, tcStartTimeAtom } from '../atoms/webSocketAtoms';

vi.mock('react-router-dom', () => ({
  useNavigate: vi.fn(),
}));

vi.mock('./useWebSocket', () => ({
  default: vi.fn(),
}));

vi.mock('./useNetworkStatus', () => ({
  default: vi.fn(),
}));

vi.mock('../utils/session', async () => {
  const actual = await vi.importActual<typeof import('../utils/session')>('../utils/session');
  return {
    ...actual,
    getRofimSession: vi.fn(),
  };
});

vi.mock('../api/rofimApi', async () => {
  const actual = await vi.importActual<typeof import('../api/rofimApi')>('../api/rofimApi');
  return {
    ...actual,
    default: {
      ...actual.default,
      // eslint-disable-next-line @cspell/spellchecker
      updateTeleconsultationStatus: vi.fn(),
      countParticipants: vi.fn(),
    },
  };
});

const mockNavigate = vi.fn();

const baseSession = {
  username: 'John Doe',
  room: 'room-1',
  token: 'token',
  authorizationHeader: 'Bearer token',
  sessionId: 'session-1',
  type: ActType.TC,
  patientId: 'patient-1',
  waitingRoom: true,
};

const renderUseWaitingDoctor = () => {
  const store = createStore();
  const utils = renderHook(() => useWaitingDoctor(), {
    wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
  });
  return { store, ...utils };
};

describe('useWaitingDoctor', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    (useNavigate as Mock).mockReturnValue(mockNavigate);
    (useWebSocket as Mock).mockReturnValue({ isSocketConnected: true });
    (useNetworkStatus as Mock).mockReturnValue(true);
    (getRofimSession as Mock).mockReturnValue(baseSession);
    (rofimApiService.updateTeleconsultationStatus as Mock).mockResolvedValue({});
    (rofimApiService.countParticipants as Mock).mockResolvedValue(0);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('alertConnectionLost', () => {
    it('is false when online and the socket is connected', () => {
      const { result } = renderUseWaitingDoctor();
      expect(result.current.alertConnectionLost).toBe(false);
    });

    it('is true when offline', () => {
      (useNetworkStatus as Mock).mockReturnValue(false);
      const { result } = renderUseWaitingDoctor();
      expect(result.current.alertConnectionLost).toBe(true);
    });

    it('is true when the socket is disconnected', () => {
      (useWebSocket as Mock).mockReturnValue({ isSocketConnected: false });
      const { result } = renderUseWaitingDoctor();
      expect(result.current.alertConnectionLost).toBe(true);
    });
  });

  describe('TC status polling', () => {
    it('notifies the backend of Wait status after 5s for a TC patient while online', async () => {
      renderUseWaitingDoctor();

      await act(async () => {
        await vi.advanceTimersByTimeAsync(5000);
      });

      expect(rofimApiService.updateTeleconsultationStatus).toHaveBeenCalledWith(
        WaitingRoomStatus.Wait
      );
    });

    it('notifies the backend of Wait status after 5s for a TCA session', async () => {
      (getRofimSession as Mock).mockReturnValue({
        ...baseSession,
        type: ActType.TCA,
        patientId: undefined,
      });
      renderUseWaitingDoctor();

      await act(async () => {
        await vi.advanceTimersByTimeAsync(5000);
      });

      expect(rofimApiService.updateTeleconsultationStatus).toHaveBeenCalledWith(
        WaitingRoomStatus.Wait
      );
    });

    it('does nothing when offline', async () => {
      (useNetworkStatus as Mock).mockReturnValue(false);
      renderUseWaitingDoctor();

      await act(async () => {
        await vi.advanceTimersByTimeAsync(5000);
      });

      expect(rofimApiService.updateTeleconsultationStatus).not.toHaveBeenCalled();
    });

    it('does nothing for a TC session without a patientId', async () => {
      (getRofimSession as Mock).mockReturnValue({ ...baseSession, patientId: undefined });
      renderUseWaitingDoctor();

      await act(async () => {
        await vi.advanceTimersByTimeAsync(5000);
      });

      expect(rofimApiService.updateTeleconsultationStatus).not.toHaveBeenCalled();
    });

    it('does nothing for other act types', async () => {
      (getRofimSession as Mock).mockReturnValue({ ...baseSession, type: ActType.RCP });
      renderUseWaitingDoctor();

      await act(async () => {
        await vi.advanceTimersByTimeAsync(5000);
      });

      expect(rofimApiService.updateTeleconsultationStatus).not.toHaveBeenCalled();
    });

    it('clears the pending call on unmount', async () => {
      const { unmount } = renderUseWaitingDoctor();

      unmount();

      await act(async () => {
        await vi.advanceTimersByTimeAsync(5000);
      });

      expect(rofimApiService.updateTeleconsultationStatus).not.toHaveBeenCalled();
    });

    it('stores the doctor delay and start time returned by the backend', async () => {
      (rofimApiService.updateTeleconsultationStatus as Mock).mockResolvedValue({
        doctorDelayInMinute: 12,
        startTime: '2026-08-25T10:00:00.000Z',
      });
      const { result, store } = renderUseWaitingDoctor();

      await act(async () => {
        await vi.advanceTimersByTimeAsync(5000);
      });

      expect(result.current.doctorDelayInMinute).toBe(12);
      expect(store.get(doctorDelayAtom)).toBe(12);
      expect(store.get(tcStartTimeAtom)).toBe(new Date('2026-08-25T10:00:00.000Z').getTime());
      expect(result.current.startTime).toBe(new Date('2026-08-25T10:00:00.000Z').getTime());
    });

    it('does not touch the delay/start time atoms when the backend omits them', async () => {
      (rofimApiService.updateTeleconsultationStatus as Mock).mockResolvedValue({});
      const { result } = renderUseWaitingDoctor();

      await act(async () => {
        await vi.advanceTimersByTimeAsync(5000);
      });

      expect(result.current.doctorDelayInMinute).toBe(0);
      expect(result.current.startTime).toBe(0);
    });

    it('navigates to the room when a participant is already present', async () => {
      (rofimApiService.countParticipants as Mock).mockResolvedValue(3);
      renderUseWaitingDoctor();

      await act(async () => {
        await vi.advanceTimersByTimeAsync(5000);
      });

      expect(mockNavigate).toHaveBeenCalledWith('/room/room-1');
    });

    it('does not navigate when no participant is present yet', async () => {
      (rofimApiService.countParticipants as Mock).mockResolvedValue(0);
      renderUseWaitingDoctor();

      await act(async () => {
        await vi.advanceTimersByTimeAsync(5000);
      });

      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('logs an error when the status update fails', async () => {
      const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      (rofimApiService.updateTeleconsultationStatus as Mock).mockRejectedValue(
        new Error('network down')
      );
      renderUseWaitingDoctor();

      await act(async () => {
        await vi.advanceTimersByTimeAsync(5000);
      });

      expect(errorSpy).toHaveBeenCalledWith('Error updating TC status:', expect.any(Error));
      errorSpy.mockRestore();
    });
  });

  describe('redirection to the room', () => {
    it('navigates to the room when the visio can already be joined', () => {
      const store = createStore();
      store.set(canJoinVisioAtom, true);
      renderHook(() => useWaitingDoctor(), {
        wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
      });

      expect(mockNavigate).toHaveBeenCalledWith('/room/room-1');
    });

    it('navigates to the room when there is no waiting room', () => {
      (getRofimSession as Mock).mockReturnValue({ ...baseSession, waitingRoom: false });
      renderUseWaitingDoctor();

      expect(mockNavigate).toHaveBeenCalledWith('/room/room-1');
    });

    it('does not navigate while waiting and the visio cannot be joined yet', () => {
      renderUseWaitingDoctor();

      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });
});
