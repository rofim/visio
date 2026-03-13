/* eslint-disable @cspell/spellchecker */
import { BrowserRouter as Router, Route, Routes, Navigate, FutureConfig } from 'react-router-dom';
import '../css/App.css';
import './css/index.css';
import React from 'react';
import Room from './pages/MeetingRoom/index';
import EquipmentsTestRoom from './pages/EquipmentsTestRoom';
import WaitingRoom from './pages/WaitingDoctor';
import SessionProvider from '../Context/SessionProvider/session';
import { PreviewPublisherProvider } from '../Context/PreviewPublisherProvider';
import { PublisherProvider } from '../Context/PublisherProvider';
import UnsupportedBrowserPage from './pages/UnsupportedBrowserPage';
import RofimInit from './context/RofimContext';
import ErrorPage from './pages/ErrorPage';
import GoodBye from './pages/GoodBye';
import initMatomo from './matomo';
import RedirectToUnsupportedBrowserPage from '@components/RedirectToUnsupportedBrowserPage';
import AppContextProvider from '../AppContextProvider';
import { DeepPartial } from '@app-types';
import { AppConfig } from '@stores/appConfig';
import useTheme from '@ui/theme';
import { Box } from '@mui/material';
import SuspenseBoundary from '@web/components/SuspenseBoundary';
import WaitingRoomSkeleton from '@pages/WaitingRoom/WaitingRoom.skeleton';
import RoomProvider from '@Context/RoomProvider';
import MeetingRoomSkeleton from '@pages/MeetingRoom/MeetingRoom.skeleton';
import { getRofimSession } from './utils/session';
import { useAtom } from 'jotai';
import { isAppInitAtom } from './atoms/webSocketAtoms';

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

  React.useEffect(() => {
    if (isAppInit) {
      const rofimSession = getRofimSession();
      initMatomo(rofimSession?.patientId);
    }
  }, [isAppInit]);

  return (
    <Box
      sx={{
        backgroundColor: theme.colors.surface,
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
                  <SuspenseBoundary fallback={<MeetingRoomSkeleton />}>
                    <RoomProvider>
                      <SessionProvider>
                        <PublisherProvider>
                          <Room />
                        </PublisherProvider>
                      </SessionProvider>
                    </RoomProvider>
                  </SuspenseBoundary>
                }
              />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
            <Route path="/goodbye" element={<GoodBye />} />
            <Route path="/unsupported-browser" element={<UnsupportedBrowserPage />} />
            <Route path="/error" element={<ErrorPage />} />
          </Routes>
        </RofimInit>
      </Router>
    </Box>
  );
};

/**
 * The wrapper is necessary temporarily since app also need to have access to theme context.
 */
const App = ({ appConfigValue }: { appConfigValue?: DeepPartial<AppConfig> }) => {
  return (
    <AppContextProvider appConfigValue={appConfigValue}>
      <InnerApp />
    </AppContextProvider>
  );
};

export default App;
