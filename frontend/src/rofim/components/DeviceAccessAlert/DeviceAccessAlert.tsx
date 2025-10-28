import { AlertTitle, Dialog, Stack, Alert } from '@mui/material';
import { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { DEVICE_ACCESS_STATUS } from '../../../utils/constants';

export type DeviceAccessAlertProps = {
  accessStatus: string | null;
};

/**
 * A component that displays an alert message asking the user to grant permissions
 * or informing them that they have declined the permissions.
 * @param {DeviceAccessAlertProps} props - the props for the component.
 *  @property {string | null} accessStatus - the current access status.
 * @returns {ReactElement | false} - The rendered DeviceAccessAlert component if not Safari
 */
const DeviceAccessAlert = ({ accessStatus }: DeviceAccessAlertProps): ReactElement | false => {
  const { t } = useTranslation();
  const messageToDisplay =
    accessStatus === DEVICE_ACCESS_STATUS.PENDING
      ? t('deviceAccessAlert.askDeviceMessage')
      : t('deviceAccessAlert.deniedDeviceMessage');

  const severity = accessStatus === DEVICE_ACCESS_STATUS.PENDING ? 'success' : 'error';

  return (
    <Stack
      sx={{
        width: '40%',
        position: 'absolute',
        left: '50%',
        top: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 10,
        alignItems: 'center',
        padding: 2,
        borderRadius: 2,
      }}
      spacing={3}
    >
      {accessStatus && (
        <Dialog open>
          <Alert severity={severity} variant="outlined" sx={{ width: '100%' }}>
            <AlertTitle>{messageToDisplay}</AlertTitle>
          </Alert>
        </Dialog>
      )}
    </Stack>
  );
};

export default DeviceAccessAlert;
