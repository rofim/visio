import { BrowserRouter as Router, Route, Routes, FutureConfig, Navigate } from 'react-router-dom';
import './css/App.css';
import './css/index.css';
import MeetingRoom from './pages/MeetingRoom';
import EquipmentsTestRoom from './pages/WaitingRoom';
import { PreviewPublisherProvider } from './Context/PreviewPublisherProvider';
import { PublisherProvider } from './Context/PublisherProvider';
import { RedirectToWaitingRoom, ErrorBoundary, EnvGuard } from './components';
import UnsupportedBrowserPage from './pages/UnsupportedBrowserPage';
import RoomProvider from './Context/RoomProvider';
import AppContextProvider from './AppContextProvider';
import RedirectToUnsupportedBrowserPage from '@components/RedirectToUnsupportedBrowserPage';
import SuspenseBoundary from '@web/components/SuspenseBoundary/SuspenseBoundary';
import WaitingRoomSkeleton from '@pages/WaitingRoom/WaitingRoom.skeleton';
import MeetingRoomSkeleton from '@pages/MeetingRoom/MeetingRoom.skeleton';
import SessionProvider from '@Context/SessionProvider/session';
import { ErrorPage } from './pages/ErrorBoundary';
import WaitingDoctorRoom from '@rofim/pages/WaitingDoctor';
import RofimInit from '@rofim/context/RofimContext';
import ExitPage from '@rofim/pages/ExitPage';
import { runtime$ } from '@core/stores';
import { videoClient } from './services';
import { NotificationsContainer } from '@ui/components';

const futureConfig: Partial<FutureConfig> = {
  /**
   * Enable relative splat paths to ensure that dynamic imports in the app work correctly regardless of the base path.
   */
  v7_relativeSplatPath: true,
  v7_startTransition: true,
};

const InnerApp = () => {
  return (
    <div className="bg-vera-surface vera-desktop:bg-vera-background relative overflow-x-hidden overflow-y-auto h-dvh">
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
              <Route path="/waiting-room" element={<WaitingDoctorRoom />} />

              <Route
                path="/room/:roomName"
                element={
                  <RedirectToWaitingRoom>
                    <SuspenseBoundary fallback={<MeetingRoomSkeleton />}>
                      <RoomProvider>
                        <SessionProvider>
                          <PublisherProvider>
                            <MeetingRoom />
                          </PublisherProvider>
                        </SessionProvider>
                      </RoomProvider>
                    </SuspenseBoundary>
                  </RedirectToWaitingRoom>
                }
              />
            </Route>

            <Route path="/goodbye" element={<ExitPage />} />
            <Route path="/unsupported-browser" element={<UnsupportedBrowserPage />} />
            <Route path="/error" element={<ErrorPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </RofimInit>
      </Router>
    </div>
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
        <runtime$.Provider videoClient={videoClient}>
          <NotificationsContainer />
          <InnerApp />
        </runtime$.Provider>
      </ErrorBoundary>
    </AppContextProvider>
  );
};

export default App;
