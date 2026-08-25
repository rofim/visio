import { MouseEvent } from 'react';
import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi, Mock } from 'vitest';
import { useNavigate } from 'react-router-dom';
import useEquipmentsTestRoom from './useEquipmentsTestRoom';
import useNetworkStatus from './useNetworkStatus';
import useWebSocket from './useWebSocket';
import { ActType, getRofimSession } from '../utils/session';
import RofimApiService, { WaitingRoomStatus } from '../api/rofimApi';

vi.mock('react-router-dom', () => ({
  useNavigate: vi.fn(),
}));

vi.mock('./useNetworkStatus', () => ({
  default: vi.fn(),
}));

vi.mock('./useWebSocket', () => ({
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
const fakeMouseEvent = { preventDefault: vi.fn() } as unknown as MouseEvent<HTMLButtonElement>;

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

describe('useEquipmentsTestRoom', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (useNavigate as Mock).mockReturnValue(mockNavigate);
    (useWebSocket as Mock).mockReturnValue({ isSocketConnected: false });
    (useNetworkStatus as Mock).mockReturnValue(true);
    (getRofimSession as Mock).mockReturnValue(baseSession);
  });

  describe('equipment check notification', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('notifies the backend after 5s for a TC patient with waitingRoom while online', async () => {
      renderHook(() => useEquipmentsTestRoom());

      await act(async () => {
        await vi.advanceTimersByTimeAsync(5000);
      });

      expect(RofimApiService.updateTeleconsultationStatus).toHaveBeenCalledWith(
        WaitingRoomStatus.CheckingEquipment
      );
    });

    it('notifies the backend after 5s for a TCA act type even without a patientId', async () => {
      (getRofimSession as Mock).mockReturnValue({
        ...baseSession,
        type: ActType.TCA,
        patientId: undefined,
      });

      renderHook(() => useEquipmentsTestRoom());

      await act(async () => {
        await vi.advanceTimersByTimeAsync(5000);
      });

      expect(RofimApiService.updateTeleconsultationStatus).toHaveBeenCalledWith(
        WaitingRoomStatus.CheckingEquipment
      );
    });

    it('does not notify the backend when offline', async () => {
      (useNetworkStatus as Mock).mockReturnValue(false);

      renderHook(() => useEquipmentsTestRoom());

      await act(async () => {
        await vi.advanceTimersByTimeAsync(5000);
      });

      expect(RofimApiService.updateTeleconsultationStatus).not.toHaveBeenCalled();
    });

    it('does not notify the backend for an act type other than TC/TCA', async () => {
      (getRofimSession as Mock).mockReturnValue({ ...baseSession, type: ActType.OTHER });

      renderHook(() => useEquipmentsTestRoom());

      await act(async () => {
        await vi.advanceTimersByTimeAsync(5000);
      });

      expect(RofimApiService.updateTeleconsultationStatus).not.toHaveBeenCalled();
    });

    it('clears the pending notification on unmount', async () => {
      const { unmount } = renderHook(() => useEquipmentsTestRoom());

      unmount();

      await act(async () => {
        await vi.advanceTimersByTimeAsync(5000);
      });

      expect(RofimApiService.updateTeleconsultationStatus).not.toHaveBeenCalled();
    });
  });

  describe('handleJoinClick', () => {
    it('prevents the default button behavior', async () => {
      (getRofimSession as Mock).mockReturnValue({
        ...baseSession,
        patientId: undefined,
        waitingRoom: false,
      });
      const { result } = renderHook(() => useEquipmentsTestRoom());

      await act(async () => {
        await result.current.handleJoinClick(fakeMouseEvent);
      });

      expect(fakeMouseEvent.preventDefault).toHaveBeenCalled();
    });

    it('navigates directly to the room when there is no patientId or waitingRoom', async () => {
      (getRofimSession as Mock).mockReturnValue({
        ...baseSession,
        patientId: undefined,
        waitingRoom: false,
      });
      const { result } = renderHook(() => useEquipmentsTestRoom());

      await act(async () => {
        await result.current.handleJoinClick(fakeMouseEvent);
      });

      expect(RofimApiService.countParticipants).not.toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith('/room/room-1');
    });

    it('navigates to the waiting room when no participant is currently in the room', async () => {
      (RofimApiService.countParticipants as Mock).mockResolvedValue(0);
      const { result } = renderHook(() => useEquipmentsTestRoom());

      await act(async () => {
        await result.current.handleJoinClick(fakeMouseEvent);
      });

      expect(mockNavigate).toHaveBeenCalledWith('/waiting-room');
      expect(result.current.isLoading).toBe(false);
    });

    it('navigates to the room when a participant is already present', async () => {
      (RofimApiService.countParticipants as Mock).mockResolvedValue(2);
      const { result } = renderHook(() => useEquipmentsTestRoom());

      await act(async () => {
        await result.current.handleJoinClick(fakeMouseEvent);
      });

      expect(mockNavigate).toHaveBeenCalledWith('/room/room-1');
      expect(result.current.isLoading).toBe(false);
    });

    it('sets isLoading to true while waiting for countParticipants to resolve', async () => {
      let resolveCount: (value: number) => void = () => {};
      (RofimApiService.countParticipants as Mock).mockImplementation(
        () =>
          new Promise<number>((resolve) => {
            resolveCount = resolve;
          })
      );
      const { result } = renderHook(() => useEquipmentsTestRoom());

      act(() => {
        void result.current.handleJoinClick(fakeMouseEvent);
      });

      await waitFor(() => expect(result.current.isLoading).toBe(true));

      act(() => {
        resolveCount(0);
      });

      await waitFor(() => expect(result.current.isLoading).toBe(false));
      expect(mockNavigate).toHaveBeenCalledWith('/waiting-room');
    });

    it('navigates to the waiting room and logs an error when countParticipants rejects', async () => {
      const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      (RofimApiService.countParticipants as Mock).mockRejectedValue(new Error('network down'));
      const { result } = renderHook(() => useEquipmentsTestRoom());

      await act(async () => {
        await result.current.handleJoinClick(fakeMouseEvent);
      });

      expect(errorSpy).toHaveBeenCalledWith('Error checking participant count:', expect.any(Error));
      expect(mockNavigate).toHaveBeenCalledWith('/waiting-room');
      expect(result.current.isLoading).toBe(false);
      errorSpy.mockRestore();
    });
  });
});
