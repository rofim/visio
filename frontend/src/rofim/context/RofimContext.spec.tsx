import { act, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi, Mock } from 'vitest';
import { createStore, Provider } from 'jotai';
import { useNavigate } from 'react-router-dom';
import RofimInit from './RofimContext';
import { isAppInitAtom } from '../atoms/webSocketAtoms';
import { isSessionInvalidAtom } from '../atoms/sessionAtoms';
import { initRofimSession, getRofimSession, ActType } from '../utils/session';
import useWebSocket from '../hooks/useWebSocket';
import useUserContext from '@hooks/useUserContext';
import { setStorageItem, STORAGE_KEYS } from '@utils/storage';
import RofimApiService, { WaitingRoomStatus } from '../api/rofimApi';

vi.mock('react-router-dom', () => ({
  useNavigate: vi.fn(),
}));

vi.mock('../utils/session', async () => {
  const actual = await vi.importActual<typeof import('../utils/session')>('../utils/session');
  return {
    ...actual,
    initRofimSession: vi.fn(),
    getRofimSession: vi.fn(),
  };
});

vi.mock('../hooks/useWebSocket', () => ({
  default: vi.fn(),
}));

vi.mock('../hooks/useMatomo', () => ({
  default: vi.fn(),
}));

vi.mock('@hooks/useUserContext', () => ({
  default: vi.fn(),
}));

vi.mock('@utils/storage', async () => {
  const actual = await vi.importActual<typeof import('@utils/storage')>('@utils/storage');
  return {
    ...actual,
    setStorageItem: vi.fn(),
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
    },
  };
});

const mockNavigate = vi.fn();
const mockInitSocket = vi.fn();
const mockSetUser = vi.fn();

const baseSession = {
  username: 'John Doe',
  room: 'room-1',
  token: 'token',
  authorizationHeader: 'Bearer token',
  sessionId: 'session-1',
  type: ActType.TC,
  waitingRoom: false,
};

const renderRofimInit = (isAppInit = false, isSessionInvalid = false) => {
  const store = createStore();
  store.set(isAppInitAtom, isAppInit);
  store.set(isSessionInvalidAtom, isSessionInvalid);
  const utils = render(
    <Provider store={store}>
      <RofimInit>
        <div data-testid="child">Protected content</div>
      </RofimInit>
    </Provider>
  );
  return { store, ...utils };
};

describe('RofimInit', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (useNavigate as Mock).mockReturnValue(mockNavigate);
    (useWebSocket as Mock).mockReturnValue({
      initSocket: mockInitSocket,
      isSocketConnected: false,
    });
    (useUserContext as Mock).mockReturnValue({
      setUser: mockSetUser,
      user: { defaultSettings: {}, issues: {} },
    });
    (initRofimSession as Mock).mockImplementation(() => {});
    (getRofimSession as Mock).mockReturnValue(baseSession);
  });

  it('does not render children until the app is fully initialized', () => {
    renderRofimInit(false);
    expect(screen.queryByTestId('child')).not.toBeInTheDocument();
  });

  it('renders children once the session is ready and isAppInit becomes true', () => {
    const { store } = renderRofimInit(false);
    expect(screen.queryByTestId('child')).not.toBeInTheDocument();

    act(() => {
      store.set(isAppInitAtom, true);
    });

    expect(screen.getByTestId('child')).toBeInTheDocument();
  });

  it('initializes the socket once the session is ready', () => {
    renderRofimInit(false);
    expect(mockInitSocket).toHaveBeenCalledTimes(1);
  });

  it('syncs the session username into the user context and storage', () => {
    renderRofimInit(true);

    expect(mockSetUser).toHaveBeenCalledTimes(1);
    const updater = mockSetUser.mock.calls[0][0];
    expect(updater({ defaultSettings: { name: 'old' } })).toEqual({
      defaultSettings: { name: 'John Doe' },
    });
    expect(setStorageItem).toHaveBeenCalledWith(STORAGE_KEYS.USERNAME, 'John Doe');
  });

  it('does not sync user when the session has no username', () => {
    (getRofimSession as Mock).mockReturnValue({ ...baseSession, username: '' });
    renderRofimInit(true);

    expect(mockSetUser).not.toHaveBeenCalled();
    expect(setStorageItem).not.toHaveBeenCalled();
  });

  it('replaces the app by the session expired page once the API rejected the session', () => {
    const { store } = renderRofimInit(true);
    expect(screen.getByTestId('child')).toBeInTheDocument();

    act(() => {
      store.set(isSessionInvalidAtom, true);
    });

    expect(screen.getByTestId('sessionExpired')).toBeInTheDocument();
    expect(screen.queryByTestId('child')).not.toBeInTheDocument();
  });

  it('navigates to the error page when session init fails', () => {
    (initRofimSession as Mock).mockImplementation(() => {
      throw new Error('boom');
    });
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    renderRofimInit(true);

    expect(mockNavigate).toHaveBeenCalledWith('/error');
    expect(screen.queryByTestId('child')).not.toBeInTheDocument();
    errorSpy.mockRestore();
  });

  it('notifies the backend on beforeunload when the act type is TCA', () => {
    (getRofimSession as Mock).mockReturnValue({ ...baseSession, type: ActType.TCA });
    renderRofimInit(true);

    window.dispatchEvent(new Event('beforeunload'));

    expect(RofimApiService.updateTeleconsultationStatus).toHaveBeenCalledWith(
      WaitingRoomStatus.Disconnected,
      { keepalive: true }
    );
  });

  it('does not notify the backend on beforeunload for non-TCA act types', () => {
    (getRofimSession as Mock).mockReturnValue({ ...baseSession, type: ActType.TC });
    renderRofimInit(true);

    window.dispatchEvent(new Event('beforeunload'));

    expect(RofimApiService.updateTeleconsultationStatus).not.toHaveBeenCalled();
  });

  it('removes the beforeunload listener on unmount', () => {
    (getRofimSession as Mock).mockReturnValue({ ...baseSession, type: ActType.TCA });
    const { unmount } = renderRofimInit(true);

    unmount();
    window.dispatchEvent(new Event('beforeunload'));

    expect(RofimApiService.updateTeleconsultationStatus).not.toHaveBeenCalled();
  });
});
