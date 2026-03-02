/* eslint-disable @cspell/spellchecker */

import { useState, useEffect, MouseEvent, ReactElement, TouchEvent } from 'react';
import Box from '@ui/Box';
import PageLayout from '@ui/PageLayout';
import usePreviewPublisherContext from '../../hooks/usePreviewPublisherContext';
import ControlPanel from '../../components/WaitingRoom/ControlPanel';
import VideoContainer from '../../components/WaitingRoom/VideoContainer';
import { DEVICE_ACCESS_STATUS } from '../../utils/constants';
import DeviceAccessAlert from '../../components/DeviceAccessAlert';
import { getStorageItem, STORAGE_KEYS } from '../../utils/storage';
import useBackgroundPublisherContext from '../../hooks/useBackgroundPublisherContext';
import backgroundEffectsDialog$ from '../../Context/BackgroundEffectsDialog';
import precallNetworkTestDialog$ from '@Context/PrecallNetworkTestDialog';
import Button from '@ui/Button';
import { useTranslation } from 'react-i18next';
import { getRofimSession } from '../utils/session';
import RofimApiService, { WaitingRoomStatus } from '../api/rofimApi';
import { useNavigate } from 'react-router-dom';
import CircularProgress from '@ui/CircularProgress';
import useNetworkStatus from '../hooks/useNetworkStatus';
import useWebSocket from '../hooks/useWebSocket';

/**
 * WaitingRoom Component from vonage
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
const EquipmentsTestRoom = (): ReactElement => {
  const { t } = useTranslation();
  const { initLocalPublisher, publisher, accessStatus, destroyPublisher } =
    usePreviewPublisherContext();

  const { initBackgroundLocalPublisher, publisher: backgroundPublisher } =
    useBackgroundPublisherContext();
  const navigate = useNavigate();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [openAudioInput, setOpenAudioInput] = useState<boolean>(false);
  const [openVideoInput, setOpenVideoInput] = useState<boolean>(false);
  const [openAudioOutput, setOpenAudioOutput] = useState<boolean>(false);
  const username = getStorageItem(STORAGE_KEYS.USERNAME) ?? '';

  const isOnline = useNetworkStatus();
  const { isSocketConnected } = useWebSocket();
  const [isLoading, setIsLoading] = useState(false);

  const rofimSession = getRofimSession();
  const room = rofimSession?.room;
  const patientId = rofimSession?.patientId;
  const waitingRoom = rofimSession?.waitingRoom;

  useEffect(() => {
    if (patientId && isOnline && isSocketConnected) {
      // TODO: a refacto quand on aura plus vonageV1
      // Pour laisser le temps au WS de se reconnecter avant d'appeler l'API
      const timeout = setTimeout(() => {
        RofimApiService.updateTeleconsultationStatus(WaitingRoomStatus.CheckingEquipment);
      }, 5000);
      return () => timeout && clearTimeout(timeout);
    }
    return () => {};
  }, [patientId, isOnline, isSocketConnected]);

  useEffect(() => {
    if (!publisher) {
      initLocalPublisher();
    }

    return () => {
      // Ensure we destroy the publisher and release any media devices.
      if (publisher) {
        destroyPublisher();
      }
    };
  }, [initLocalPublisher, publisher, destroyPublisher]);

  useEffect(() => {
    if (!backgroundPublisher) {
      initBackgroundLocalPublisher();
    }
  }, [initBackgroundLocalPublisher, backgroundPublisher]);

  // After changing device permissions, reload the page to reflect the device's permission change.
  useEffect(() => {
    if (accessStatus === DEVICE_ACCESS_STATUS.ACCESS_CHANGED) {
      window.location.reload();
    }
  }, [accessStatus]);

  const handleAudioInputOpen = (
    event: MouseEvent<HTMLButtonElement> | TouchEvent<HTMLButtonElement>
  ) => {
    setAnchorEl(event.currentTarget);
    setOpenAudioInput(true);
  };

  const handleVideoInputOpen = (
    event: MouseEvent<HTMLButtonElement> | TouchEvent<HTMLButtonElement>
  ) => {
    setAnchorEl(event.currentTarget);
    setOpenVideoInput(true);
  };

  const handleAudioOutputOpen = (
    event: MouseEvent<HTMLButtonElement> | TouchEvent<HTMLButtonElement>
  ) => {
    setAnchorEl(event.currentTarget);
    setOpenAudioOutput(true);
  };

  const handleClose = () => {
    setAnchorEl(null);
    setOpenAudioInput(false);
    setOpenAudioOutput(false);
    setOpenVideoInput(false);
  };

  const handleJoinRoom = async (e: MouseEvent<HTMLButtonElement>) => {
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
        <Box data-testid="EquipmentsTestRoom">
          <PageLayout>
            <PageLayout.Left>
              <Box
                sx={{
                  maxWidth: '100%',
                  display: 'inline-flex',
                  flexDirection: 'column',
                  height: { xs: 'auto', sm: '400px' },
                }}
              >
                <VideoContainer username={username} />
                {accessStatus === DEVICE_ACCESS_STATUS.ACCEPTED && (
                  <>
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
                    <Button onClick={handleJoinRoom} disabled={!username && isLoading}>
                      {t('button.join')}
                      {isLoading && (
                        <CircularProgress
                          className="ml-3"
                          sx={{
                            position: 'relative',
                          }}
                          size={25}
                          data-testid="CircularProgress"
                        />
                      )}
                    </Button>
                  </>
                )}
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

export default EquipmentsTestRoom;
