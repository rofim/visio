/* eslint-disable @cspell/spellchecker */

import { ReactElement, useEffect } from 'react';
import WarningIcon from '@mui/icons-material/Warning';
import { useNavigate } from 'react-router-dom';
import { Trans, useTranslation } from 'react-i18next';
import { getRofimSession } from '../utils/session';
import rofimApiService, { WaitingRoomStatus } from '../utils/rofimApi.service';
import useWebSocket from '../hooks/useWebSocket';
import { getFormattedTime } from '../../utils/dateTime';

const WaitingDoctor = (): ReactElement => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { doctorDelayInMinute, showDoctorDelay, startTime } = useWebSocket();

  const session = getRofimSession();
  const room = session?.room;
  const patientId = session?.patientId;

  // TODO
  const participantCount = 0;
  const hasParticipants = participantCount > 0;

  useEffect(() => {
    if (patientId) {
      rofimApiService.updateTeleconsultationStatus(WaitingRoomStatus.Wait);
    }
  }, [patientId]);

  // Redirection réactive vers la room dès qu'un participant rejoint (le docteur est le premier participant)
  useEffect(() => {
    if (hasParticipants && room) {
      navigate(`/room/${room}`, {
        state: {
          hasAccess: true,
        },
      });
    }
  }, [hasParticipants, room, navigate]);

  return (
    <div className="flex size-full flex-col bg-[#F5F6F8]" data-testid="waitingDoctor">
      <div className="flex min-h-screen w-full flex-col items-center justify-center p-4">
        <h1 className="mb-8 text-center text-[32px] font-bold text-black">
          {t('waitingRoom.title')}
        </h1>
        <div className="w-full max-w-4xl rounded-lg bg-white p-14 shadow-sm">
          {showDoctorDelay && (
            <div className="mb-4 flex items-start rounded border border-[#FEF08A] bg-[#FEFCE8] p-4 shadow-md">
              <div className="flex-1">
                <div className="flex items-start gap-2">
                  <WarningIcon sx={{ color: '#CA8A04', fontSize: 20 }} />
                  <strong>{t('waitingRoom.doctorDelayed.title')}</strong>
                </div>
                <div className="mt-2 w-full">
                  <p>
                    <Trans
                      i18nKey="waitingRoom.doctorDelayed.message"
                      values={{
                        doctorDelayInMinute,
                        startTime: getFormattedTime(i18n.language, startTime),
                      }}
                      components={{ b: <b />, br: <br /> }}
                    />
                  </p>
                </div>
              </div>
            </div>
          )}
          <div className="flex flex-col items-center space-y-6">
            <img src="public/images/medecin.png" alt="doctor" className="size-[120px]" />

            <h2 className="text-center text-2xl font-bold text-primary">
              {t('waitingRoom.message')}
            </h2>

            <div className="space-y-3 text-center">
              <p className="text-xl leading-relaxed text-grey-b">{t('waitingRoom.redirection')}</p>
              <p className="text-xl leading-relaxed text-grey-b">{t('waitingRoom.pleaseWait')}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WaitingDoctor;
