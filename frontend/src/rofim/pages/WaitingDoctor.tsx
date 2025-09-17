/* eslint-disable @cspell/spellchecker */
import { ReactElement, useEffect, useState } from 'react';
import WarningIcon from '@mui/icons-material/Warning';
import LocalPhoneIcon from '@mui/icons-material/LocalPhone';
import { useNavigate } from 'react-router-dom';
import { Trans, useTranslation } from 'react-i18next';
import { useAtom } from 'jotai';
import { Alert, Fade } from '@mui/material';
import { getRofimSession } from '../utils/session';
import rofimApiService, { WaitingRoomStatus } from '../api/rofimApi';
import { getFormattedTime } from '../../utils/dateTime';
import { canJoinVisioAtom, doctorDelayAtom, tcStartTimeAtom } from '../atoms/webSocketAtoms';
import useWebSocket from '../hooks/useWebSocket';
import useNetworkStatus from '../hooks/useNetworkStatus';

const WaitingRoom = (): ReactElement => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [doctorDelayInMinute, setDoctorDelayInMinute] = useAtom(doctorDelayAtom);
  const [startTime, setStartTime] = useAtom(tcStartTimeAtom);
  const [canJoinVisio] = useAtom(canJoinVisioAtom);
  const [alertConnectionLost, setConnectionLost] = useState<boolean>(false);
  const { isSocketConnected } = useWebSocket();
  const isOnline = useNetworkStatus();

  const session = getRofimSession();
  const room = session?.room;
  const patientId = session?.patientId;
  const waitingRoom = session?.waitingRoom;

  useEffect(() => {
    setConnectionLost(!isOnline);
  }, [isOnline]);

  useEffect(() => {
    if (patientId && waitingRoom && isOnline && isSocketConnected) {
      const updateTCStatus = async () => {
        const tc = await rofimApiService.updateTeleconsultationStatus(WaitingRoomStatus.Wait);
        if (tc.doctorDelayInMinute && tc.startTime) {
          setDoctorDelayInMinute(tc.doctorDelayInMinute);
          setStartTime(new Date(tc.startTime).getTime());
        }

        // Redirection vers la room s'il y a déjà un participant (le docteur est le premier participant)
        const hasParticipantCount = await rofimApiService.countParticipants();
        if (hasParticipantCount) {
          navigate(`/room/${room}`);
        }
      };
      // TODO: a refacto quand on aura plus vonageV1
      // Pour laisser le temps au WS de se reconnecter avant d'appeler l'API
      setTimeout(() => {
        updateTCStatus();
      }, 1000);
    }
  }, [
    waitingRoom,
    patientId,
    setDoctorDelayInMinute,
    setStartTime,
    room,
    navigate,
    isOnline,
    isSocketConnected,
  ]);

  useEffect(() => {
    if (canJoinVisio || !waitingRoom) {
      navigate(`/room/${room}`);
    }
  }, [canJoinVisio, waitingRoom, room, navigate]);

  return (
    <div className="flex size-full flex-col bg-[#F5F6F8]" data-testid="waitingDoctor">
      <Fade in={alertConnectionLost}>
        <Alert severity="warning" className="m-8 ml-auto w-full max-w-96 text-left">
          {t('waitingRoom.connectionLost')}
        </Alert>
      </Fade>
      <div className="flex w-full flex-col items-center justify-center p-4">
        <h1 className="mb-8 text-center text-[32px] font-bold text-black">
          {t('waitingRoom.title')}
        </h1>
        <div className="w-full max-w-4xl rounded-lg bg-white p-14 shadow-sm">
          <div className="flex flex-col items-center space-y-6">
            {!!doctorDelayInMinute && startTime && (
              <div className="mb-4 flex rounded bg-[#fff1cf] p-4 shadow-md">
                <div className="flex-1">
                  <div className="flex gap-4">
                    <WarningIcon sx={{ color: '#efc100', fontSize: 20 }} />
                    <div className="w-full text-left">
                      <strong>{t('waitingRoom.doctorDelayed.title')}</strong>
                      <p>
                        <Trans
                          i18nKey="waitingRoom.doctorDelayed.message"
                          values={{
                            doctorDelayInMinute,
                            startTime: getFormattedTime(
                              i18n.language,
                              startTime + doctorDelayInMinute * 60 * 1000
                            ),
                          }}
                        />
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <img src="images/medecin.png" alt="doctor" className="size-[120px]" />

            <h2 className="text-center text-2xl font-bold text-primary">
              {t('waitingRoom.message')}
            </h2>

            <div className="text-center text-xl text-grey-b">
              <p>{t('waitingRoom.redirection')}</p>
              <p>{t('waitingRoom.pleaseWait')}</p>
            </div>
          </div>
        </div>
        <p className="w-full max-w-4xl p-16 text-left text-xl">
          <LocalPhoneIcon sx={{ fontSize: 20, display: 'inline' }} className="mr-1" />
          {t('waitingRoom.disclaimer')}
        </p>
      </div>
    </div>
  );
};

export default WaitingRoom;
