/* eslint-disable @cspell/spellchecker */
/* eslint @typescript-eslint/no-floating-promises: 0 */

import { FC, MouseEvent, useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import PageLayout from '@ui/PageLayout';
import ControlPanel from '@components/WaitingRoom/ControlPanel';
import VideoContainer from '@components/WaitingRoom/VideoContainer';
import DeviceAccessAlert from '../components/DeviceAccessAlert';
import { DEVICE_ACCESS_STATUS } from '@utils/constants';
import backgroundEffectsDialog$ from '@Context/BackgroundEffectsDialog';
import precallNetworkTestDialog$ from '@Context/PrecallNetworkTestDialog';
import VideoContainerSkeleton from '@components/WaitingRoom/VideoContainer/VideoContainer.skeleton';
import useWaitingRoom from '@hooks/useWaitingRoom';
import useNetworkStatus from '../hooks/useNetworkStatus';
import useWebSocket from '../hooks/useWebSocket';
import { getRofimSession } from '../utils/session';
import RofimApiService, { WaitingRoomStatus } from '../api/rofimApi';
import { useNavigate } from 'react-router-dom';
import { Alert, CircularProgress } from '@mui/material';
import { Trans, useTranslation } from 'react-i18next';
import Button from '@mui/material/Button';
import useTheme from '@ui/theme';

/**
 * WaitingRoom Component
 *
 * This component renders the waiting room page of the application, including:
 * - A banner containing a company logo, a date-time widget, and a navigable button to a GitHub repo.
 * - A video element showing the user how they'll appear upon joining a room containing controls to:
 *   - Mute their audio input device.
 *   - Disable their video input device.
 *   - Button to configure background replacement (if supported).
 * - Audio input, audio output, and video input device selectors.
 * - A username input field.
 * - A button to run a pre-call network test.
 * - The meeting room name and a button to join the room.
 * @returns {ReactElement} - The waiting room.
 */
const WaitingRoom: FC = () => {
  const {
    anchorEl,
    openAudioInput,
    openVideoInput,
    openAudioOutput,
    username,
    accessStatus,
    isRoomReady,
    handleAudioInputOpen,
    handleVideoInputOpen,
    handleAudioOutputOpen,
    handleClose,
  } = useWaitingRoom();

  const theme = useTheme();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const isOnline = useNetworkStatus();
  const { isSocketConnected } = useWebSocket();
  const [isLoading, setIsLoading] = useState(false);

  const rofimSession = getRofimSession();
  const room = rofimSession?.room;
  const patientId = rofimSession?.patientId;
  const waitingRoom = rofimSession?.waitingRoom;

  useEffect(() => {
    if (patientId && isOnline) {
      // Pour laisser le temps au WS de se reconnecter avant d'appeler l'API
      const timeout = setTimeout(() => {
        RofimApiService.updateTeleconsultationStatus(WaitingRoomStatus.CheckingEquipment);
      }, 5000);
      return () => timeout && clearTimeout(timeout);
    }
    return () => {};
  }, [patientId, isOnline, isSocketConnected]);

  const handleJoinClick = async (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    if (patientId && waitingRoom) {
      try {
        // Start visio if there is someone in the room (doctor enter first)
        setIsLoading(true);
        const hasParticipantCount = await RofimApiService.countParticipants();
        if (!hasParticipantCount) {
          return navigate('/waiting-room');
        }
      } catch (error) {
        console.error('Error checking participant count:', error);
        return navigate('/waiting-room');
      } finally {
        setIsLoading(false);
      }
    }
    return navigate(`/room/${room}`);
  };

  return (
    <backgroundEffectsDialog$.Provider>
      <precallNetworkTestDialog$.Provider>
        <Box data-testid="waitingRoom" className="m-0">
          <PageLayout>
            <PageLayout.Left>
              <Box className="flex flex-col  max-w-full  animate-fade-in m-0">
                {isRoomReady && (
                  <>
                    <VideoContainer username={username} />
                    <ControlPanel
                      handleAudioInputOpen={handleAudioInputOpen}
                      handleVideoInputOpen={handleVideoInputOpen}
                      handleAudioOutputOpen={handleAudioOutputOpen}
                      handleClose={handleClose}
                      openAudioInput={openAudioInput}
                      openVideoInput={openVideoInput}
                      openAudioOutput={openAudioOutput}
                      anchorEl={anchorEl}
                    />
                    {!!patientId && waitingRoom === false && (
                      <Alert
                        icon={false}
                        sx={{
                          color: theme.colors.alertText,
                          background: theme.colors.warning,
                          borderColor: theme.colors.warningHover,
                          border: '1px solid',
                          marginBottom: 4,
                          maxWidth: 584,
                        }}
                      >
                        <Trans i18nKey="equipmentsTestRoom.patient.disclaimer" />
                      </Alert>
                    )}

                    <Button
                      onClick={handleJoinClick}
                      disabled={!username && isLoading}
                      variant="contained"
                      color="primary"
                      type="submit"
                    >
                      {t('button.join')}
                      {!!isLoading && (
                        <CircularProgress
                          className="ml-3"
                          sx={{
                            position: 'relative',
                            color: theme.colors.onPrimary,
                          }}
                          size={25}
                          data-testid="CircularProgress"
                        />
                      )}
                    </Button>
                  </>
                )}

                {!isRoomReady && <VideoContainerSkeleton />}
              </Box>
            </PageLayout.Left>
          </PageLayout>
          {accessStatus !== DEVICE_ACCESS_STATUS.ACCEPTED && (
            <DeviceAccessAlert accessStatus={accessStatus} />
          )}
        </Box>
      </precallNetworkTestDialog$.Provider>
    </backgroundEffectsDialog$.Provider>
  );
};

export default WaitingRoom;
