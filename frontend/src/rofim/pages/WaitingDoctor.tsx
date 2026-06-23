import { ReactElement } from 'react';
import LocalPhoneIcon from '@mui/icons-material/LocalPhone';
import { Trans, useTranslation } from 'react-i18next';
import { getFormattedTime } from '../../utils/dateTime';
import Box from '@mui/material/Box';
import PageLayout from '@ui/PageLayout';
import Typography from '@mui/material/Typography';
import useTheme from '@ui/theme';
import Fade from '@mui/material/Fade';
import Alert from '@mui/material/Alert';
import useWaitingDoctor from '../hooks/useWaitingDoctor';

const WaitingRoom = (): ReactElement => {
  const { t, i18n } = useTranslation();
  const theme = useTheme();
  const { alertConnectionLost, doctorDelayInMinute, startTime } = useWaitingDoctor();

  return (
    <Box data-testid="waitingDoctor">
      <PageLayout>
        <PageLayout.Left>
          <Box
            sx={{
              maxWidth: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignSelf: 'start',
              gap: 4,
            }}
          >
            <Fade in={alertConnectionLost}>
              <Alert
                severity="warning"
                className="ml-auto w-full max-w-96"
                sx={{
                  color: theme.colors.alertText,
                  background: theme.colors.warning,
                  borderRadius: theme.shapes.borderRadiusLarge,
                  textAlign: 'start',
                }}
              >
                <Typography>{t('waitingRoom.connectionLost')}</Typography>
              </Alert>
            </Fade>

            <Typography
              variant="h1"
              sx={{
                color: theme.colors.textSecondary,
                fontSize: '2rem',
              }}
            >
              {t('waitingRoom.title')}
            </Typography>

            <Box
              sx={{
                p: 7,
                backgroundColor: theme.colors.background,
                borderRadius: theme.shapes.borderRadiusLarge,
              }}
            >
              {!!doctorDelayInMinute && startTime && (
                <Alert
                  severity="warning"
                  sx={{
                    backgroundColor: '#fff1cf',
                    borderRadius: theme.shapes.borderRadiusLarge,
                    mb: 2,
                  }}
                >
                  <Typography
                    sx={{
                      color: theme.colors.warning,
                      fontWeight: theme.typography.weight['caption-semibold'].value,
                      textAlign: 'start',
                    }}
                  >
                    {t('waitingRoom.doctorDelayed.title')}
                  </Typography>
                  <Typography
                    sx={{
                      color: theme.colors.warning,
                      textAlign: 'start',
                    }}
                  >
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
                  </Typography>
                </Alert>
              )}

              <img src="images/medecin.png" alt="doctor" className="size-30 justify-self-center" />

              <Typography
                variant="h2"
                sx={{
                  color: theme.colors.textPrimary,
                  fontSize: '1.5rem',
                }}
              >
                {t('waitingRoom.message')}
              </Typography>

              <Typography
                variant="h6"
                sx={{
                  color: theme.colors.textTertiary,
                }}
              >
                {t('waitingRoom.redirection')}
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  color: theme.colors.textTertiary,
                }}
              >
                {t('waitingRoom.pleaseWait')}
              </Typography>
            </Box>

            <Typography
              sx={{
                color: theme.colors.textSecondary,
              }}
            >
              <LocalPhoneIcon sx={{ fontSize: 20, display: 'inline' }} className="mr-1" />
              {t('waitingRoom.disclaimer')}
            </Typography>
          </Box>
        </PageLayout.Left>
      </PageLayout>
    </Box>
  );
};

export default WaitingRoom;
