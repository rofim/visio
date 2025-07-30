import { useState, useEffect, MouseEvent, ReactElement, TouchEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import usePreviewPublisherContext from '../../hooks/usePreviewPublisherContext';
import ControlPanel from '../../components/WaitingRoom/ControlPanel';
import VideoContainer from '../../components/WaitingRoom/VideoContainer';
import { DEVICE_ACCESS_STATUS } from '../../utils/constants';
import DeviceAccessAlert from '../../components/DeviceAccessAlert';
import { getStorageItem, STORAGE_KEYS } from '../../utils/storage';
import useIsSmallViewport from '../../hooks/useIsSmallViewport';
import { getRofimSession } from '../utils/session';
import Button from '../components/Button';
import RofimApiService, { WaitingRoomStatus } from '../api/rofimApi';
import useSessionContext from '../../hooks/useSessionContext';

/**
 * WaitingRoom Component
 *
 * This component renders the waiting room page of the application, including:
 * - A banner containing a company logo, a date-time widget, and a navigable button to a GitHub repo.
 * - A video element showing the user how they'll appear upon joining a room containing controls to:
 *   - Mute their audio input device.
 *   - Disable their video input device.
 *   - Toggle on/off background blur (if supported).
 * - Audio input, audio output, and video input device selectors.
 * - A username input field.
 * - The meeting room name and a button to join the room.
 * @returns {ReactElement} - The waiting room.
 */
const WaitingRoom = (): ReactElement => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { initLocalPublisher, publisher, accessStatus, destroyPublisher } =
    usePreviewPublisherContext();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [openAudioInput, setOpenAudioInput] = useState<boolean>(false);
  const [openVideoInput, setOpenVideoInput] = useState<boolean>(false);
  const [openAudioOutput, setOpenAudioOutput] = useState<boolean>(false);
  const username = getStorageItem(STORAGE_KEYS.USERNAME) ?? '';
  const isSmallViewport = useIsSmallViewport();

  const { subscriberWrappers, joinRoom } = useSessionContext();
  const rofimSession = getRofimSession();
  const room = rofimSession?.room;
  const patientId = rofimSession?.patientId;
  const hasParticipants = subscriberWrappers.length > 0;

  useEffect(() => {
    // Je dois joinRoom pour pouvoir avoir le useSessionContext partagé entre mes composants
    if (joinRoom && room) {
      joinRoom(room);
    }

    if (patientId) {
      RofimApiService.updateTeleconsultationStatus(WaitingRoomStatus.CheckingEquipment);
      console.log('updateTeleconsultationStatus');
    }
  }, [patientId]);

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

  const handleJoinRoom = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (patientId !== 'null' && patientId !== null && !hasParticipants) {
      navigate('/waiting-doctor');
    } else {
      navigate(`/room/${room}`, {
        state: {
          hasAccess: true,
        },
      });
    }
  };

  return (
    <div className="flex size-full flex-col bg-white" data-testid="waitingRoom">
      <div className="flex w-full">
        <div className="flex w-full justify-center">
          <div className="flex w-full flex-col items-center justify-center sm:min-h-[90vh] md:flex-row">
            <div
              className={`max-w-full flex-col items-center ${isSmallViewport ? '' : 'h-[394px]'} sm: inline-flex`}
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
                  <Button onClick={handleJoinRoom} disabled={!username}>
                    {t('button.join')}
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
        {accessStatus !== DEVICE_ACCESS_STATUS.ACCEPTED && (
          <DeviceAccessAlert accessStatus={accessStatus} />
        )}
      </div>
    </div>
  );
};

export default WaitingRoom;
