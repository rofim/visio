import { Tooltip } from '@mui/material';
import PictureInPictureAltIcon from '@mui/icons-material/PictureInPictureAlt';
import { useTranslation } from 'react-i18next';
import ToolbarButton from '../../../components/MeetingRoom/ToolbarButton';
import usePictureInPicture from '../../hooks/usePictureInPicture';
import './index.css';

const PictureInPictureButton = ({ className }: { className?: string }) => {
  const { t } = useTranslation();
  const { isPipActive, togglePip, isPipAvailable } = usePictureInPicture();
  const title = isPipActive ? t('pip.state.off') : t('pip.state.on');
  // Check if Picture-in-Picture is supported in browser
  if (!('documentPictureInPicture' in window)) {
    console.warn('Picture-in-Picture is not supported in this browser.');
    return null;
  }

  return (
    <Tooltip className={className} title={title} aria-label={t('pip.ariaLabel')}>
      <ToolbarButton
        onClick={togglePip}
        icon={
          <PictureInPictureAltIcon
            style={{ color: `${!isPipActive ? 'white' : 'rgb(138, 180, 248)'}` }}
          />
        }
        data-testid="pip-button"
        sx={{
          marginTop: '4px',
          opacity: isPipAvailable ? 1 : 0.5,
          cursor: isPipAvailable ? 'pointer' : 'not-allowed',
        }}
      />
    </Tooltip>
  );
};

export default PictureInPictureButton;
