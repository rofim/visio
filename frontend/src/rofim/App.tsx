/* eslint-disable @cspell/spellchecker */

import { BrowserRouter as Router, Route, Routes, FutureConfig, Navigate } from 'react-router-dom';
import '../css/App.css';
import '../css/index.css';
import GoodBye from './pages/GoodBye';
import EquipmentsTestRoom from './pages/EquipmentsTestRoom';
import { PreviewPublisherProvider } from '../Context/PreviewPublisherProvider';
import { PublisherProvider } from '../Context/PublisherProvider';
import RedirectToWaitingRoom from '../components/RedirectToWaitingRoom';
import UnsupportedBrowserPage from '../pages/UnsupportedBrowserPage';
import RoomProvider from '../Context/RoomProvider';
import Box from '@mui/material/Box';
import useTheme from '@ui/theme';
import AppContextProvider from '../AppContextProvider';
import RedirectToUnsupportedBrowserPage from '@components/RedirectToUnsupportedBrowserPage';
import SuspenseBoundary from '@web/components/SuspenseBoundary/SuspenseBoundary';
import WaitingRoomSkeleton from '@pages/WaitingRoom/WaitingRoom.skeleton';
import MeetingRoomSkeleton from '@pages/MeetingRoom/MeetingRoom.skeleton';
import SessionProvider from '@Context/SessionProvider/session';
import ErrorBoundary from '../components/ErrorBoundary';
import EnvGuard from '../components/EnvGuard';
import { ErrorPage } from '../pages/ErrorBoundary';
import RofimInit from './context/RofimContext';
import WaitingRoom from './pages/WaitingDoctor';
import Room from './pages/MeetingRoom/index';
import { isAppInitAtom } from './atoms/webSocketAtoms';
import { useAtom } from 'jotai';
import { useEffect } from 'react';
import initMatomo from './matomo';
import { getRofimSession } from './utils/session';

const futureConfig: Partial<FutureConfig> = {
  /**
   * Enable relative splat paths to ensure that dynamic imports in the app work correctly regardless of the base path.
   */
  v7_relativeSplatPath: true,
  v7_startTransition: true,
};

const InnerApp = () => {
  const theme = useTheme();

  const [isAppInit] = useAtom(isAppInitAtom);

  useEffect(() => {
    if (isAppInit) {
      const rofimSession = getRofimSession();
      initMatomo(rofimSession?.patientId);
    }
  }, [isAppInit]);

  return (
    <Box
      sx={{
        backgroundColor: {
          xs: theme.colors.surface,
          md: theme.colors.background,
        },
        position: 'relative',
        overflowX: 'hidden',
        overflowY: 'auto',
        height: '100dvh',
      }}
    >
      <Router future={futureConfig}>
        <RofimInit>
          <Routes>
            <Route element={<RedirectToUnsupportedBrowserPage />}>
              <Route
                path="/"
                element={
                  <SuspenseBoundary fallback={<WaitingRoomSkeleton />}>
                    <RoomProvider>
                      <PreviewPublisherProvider>
                        <EquipmentsTestRoom />
                      </PreviewPublisherProvider>
                    </RoomProvider>
                  </SuspenseBoundary>
                }
              />
              <Route path="/waiting-room" element={<WaitingRoom />} />
              <Route
                path="/room/:roomName"
                element={
                  <RedirectToWaitingRoom>
                    <SuspenseBoundary fallback={<MeetingRoomSkeleton />}>
                      <RoomProvider>
                        <SessionProvider>
                          <PublisherProvider>
                            <Room />
                          </PublisherProvider>
                        </SessionProvider>
                      </RoomProvider>
                    </SuspenseBoundary>
                  </RedirectToWaitingRoom>
                }
              />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
            <Route path="/goodbye" element={<GoodBye />} />
            <Route path="/unsupported-browser" element={<UnsupportedBrowserPage />} />
            {/* <Route path="/error" element={<ErrorPage />} /> */}
          </Routes>
        </RofimInit>
      </Router>
    </Box>
  );
};

/**
 * The wrapper is necessary temporarily since app also need to have access to theme context.
 */
const App = () => {
  return (
    <AppContextProvider>
      <ErrorBoundary fallback={(error) => <ErrorPage error={error} />}>
        <EnvGuard />
        <InnerApp />
      </ErrorBoundary>
    </AppContextProvider>
  );
};

export default App;
