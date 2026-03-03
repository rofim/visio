import { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { DEVICE_ACCESS_STATUS } from '../../../utils/constants';
import Alert from '@mui/material/Alert';
import Dialog from '@mui/material/Dialog';
import Stack from '@mui/material/Stack';
import AlertTitle from '@mui/material/AlertTitle';

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
          <Alert severity={severity} sx={{ width: '100%' }}>
            <AlertTitle>{messageToDisplay}</AlertTitle>
          </Alert>
        </Dialog>
      )}
    </Stack>
  );
};

export default DeviceAccessAlert;
