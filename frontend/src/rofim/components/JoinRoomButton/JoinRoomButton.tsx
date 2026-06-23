import { FC, MouseEvent } from 'react';
import Button from '@mui/material/Button';
import { Alert, CircularProgress } from '@mui/material';
import { Trans, useTranslation } from 'react-i18next';
import useTheme from '@ui/theme';

interface JoinRoomButtonProps {
  isLoading: boolean;
  isDisabled: boolean;
  patientId?: string;
  waitingRoom?: boolean;
  onClick: (e: MouseEvent<HTMLButtonElement>) => void;
}

const JoinRoomButton: FC<JoinRoomButtonProps> = ({
  isLoading,
  isDisabled,
  patientId,
  waitingRoom,
  onClick,
}) => {
  const theme = useTheme();
  const { t } = useTranslation();

  return (
    <>
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
        onClick={onClick}
        disabled={isDisabled}
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
  );
};

export default JoinRoomButton;
