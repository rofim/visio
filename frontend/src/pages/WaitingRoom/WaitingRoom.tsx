import { FC } from 'react';
import Box from '@mui/material/Box';
import PageLayout from '@ui/PageLayout';
import ControlPanel from '@components/WaitingRoom/ControlPanel';
import VideoContainer from '@components/WaitingRoom/VideoContainer';
import DeviceAccessAlert from '@components/DeviceAccessAlert';
import { DEVICE_ACCESS_STATUS } from '@utils/constants';
import backgroundEffectsDialog$ from '@Context/BackgroundEffectsDialog';
import precallNetworkTestDialog$ from '@Context/PrecallNetworkTestDialog';
import VideoContainerSkeleton from '@components/WaitingRoom/VideoContainer/VideoContainer.skeleton';
import useWaitingRoom from '@hooks/useWaitingRoom';
import useEquipmentsTestRoom from '@rofim/hooks/useEquipmentsTestRoom';
import JoinRoomButton from '@rofim/components/JoinRoomButton/JoinRoomButton';

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

  const { isLoading, patientId, waitingRoom, handleJoinClick } = useEquipmentsTestRoom();

  return (
    <backgroundEffectsDialog$.Provider>
      <precallNetworkTestDialog$.Provider>
        <Box data-testid="waitingRoom">
          <PageLayout>
            <PageLayout.Left>
              <Box>
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
                    <JoinRoomButton
                      isLoading={isLoading}
                      isDisabled={!username && isLoading}
                      patientId={patientId}
                      waitingRoom={waitingRoom}
                      onClick={handleJoinClick}
                    />
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
