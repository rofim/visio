import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi, Mock } from 'vitest';
import useRofimMeeting from './useRofimMeeting';
import useWebSocket from './useWebSocket';
import useSessionContext from '../../hooks/useSessionContext';
import { ActType, getRofimSession } from '../utils/session';
import RofimApiService, { WaitingRoomStatus } from '../api/rofimApi';

vi.mock('./useWebSocket', () => ({
  default: vi.fn(),
}));

vi.mock('../../hooks/useSessionContext', () => ({
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
      doctorJoinVisio: vi.fn(),
    },
  };
});

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

describe('useRofimMeeting', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    (useWebSocket as Mock).mockReturnValue({ isSocketConnected: false });
    (useSessionContext as Mock).mockReturnValue({ subscriberWrappers: [] });
    (getRofimSession as Mock).mockReturnValue(baseSession);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('patient in a TC act', () => {
    it('notifies the backend that the visio is in progress after 5s', async () => {
      renderHook(() => useRofimMeeting());

      await act(async () => {
        await vi.advanceTimersByTimeAsync(5000);
      });

      expect(RofimApiService.updateTeleconsultationStatus).toHaveBeenCalledWith(
        WaitingRoomStatus.Progress
      );
      expect(RofimApiService.doctorJoinVisio).not.toHaveBeenCalled();
    });

    it('clears the pending notification on unmount', async () => {
      const { unmount } = renderHook(() => useRofimMeeting());

      unmount();

      await act(async () => {
        await vi.advanceTimersByTimeAsync(5000);
      });

      expect(RofimApiService.updateTeleconsultationStatus).not.toHaveBeenCalled();
    });
  });

  describe('doctor in a TC act (no patientId)', () => {
    beforeEach(() => {
      (getRofimSession as Mock).mockReturnValue({ ...baseSession, patientId: undefined });
    });

    it('joins the visio immediately when no subscriber is connected yet', () => {
      renderHook(() => useRofimMeeting());

      expect(RofimApiService.doctorJoinVisio).toHaveBeenCalledTimes(1);
      expect(RofimApiService.updateTeleconsultationStatus).not.toHaveBeenCalled();
    });

    it('retries joining the visio every 15s until a subscriber connects', async () => {
      renderHook(() => useRofimMeeting());
      expect(RofimApiService.doctorJoinVisio).toHaveBeenCalledTimes(1);

      await act(async () => {
        await vi.advanceTimersByTimeAsync(15000);
      });
      expect(RofimApiService.doctorJoinVisio).toHaveBeenCalledTimes(2);

      await act(async () => {
        await vi.advanceTimersByTimeAsync(15000);
      });
      expect(RofimApiService.doctorJoinVisio).toHaveBeenCalledTimes(3);
    });

    it('stops retrying once unmounted', async () => {
      const { unmount } = renderHook(() => useRofimMeeting());
      expect(RofimApiService.doctorJoinVisio).toHaveBeenCalledTimes(1);

      unmount();

      await act(async () => {
        await vi.advanceTimersByTimeAsync(15000);
      });
      expect(RofimApiService.doctorJoinVisio).toHaveBeenCalledTimes(1);
    });

    it('does not attempt to join once a subscriber is already connected', async () => {
      (useSessionContext as Mock).mockReturnValue({
        subscriberWrappers: [{ id: 'sub-1' }],
      });

      renderHook(() => useRofimMeeting());

      await act(async () => {
        await vi.advanceTimersByTimeAsync(15000);
      });

      expect(RofimApiService.doctorJoinVisio).not.toHaveBeenCalled();
    });
  });

  describe('TCA act', () => {
    beforeEach(() => {
      (getRofimSession as Mock).mockReturnValue({ ...baseSession, type: ActType.TCA });
    });

    it('notifies the backend that the visio is in progress after 5s', async () => {
      renderHook(() => useRofimMeeting());

      await act(async () => {
        await vi.advanceTimersByTimeAsync(5000);
      });

      expect(RofimApiService.updateTeleconsultationStatus).toHaveBeenCalledWith(
        WaitingRoomStatus.Progress
      );
    });

    it('clears the pending notification on unmount', async () => {
      const { unmount } = renderHook(() => useRofimMeeting());

      unmount();

      await act(async () => {
        await vi.advanceTimersByTimeAsync(5000);
      });

      expect(RofimApiService.updateTeleconsultationStatus).not.toHaveBeenCalled();
    });
  });

  describe('other act types', () => {
    it('does nothing for RCP or unhandled act types', async () => {
      (getRofimSession as Mock).mockReturnValue({ ...baseSession, type: ActType.RCP });

      renderHook(() => useRofimMeeting());

      await act(async () => {
        await vi.advanceTimersByTimeAsync(20000);
      });

      expect(RofimApiService.updateTeleconsultationStatus).not.toHaveBeenCalled();
      expect(RofimApiService.doctorJoinVisio).not.toHaveBeenCalled();
    });
  });
});
