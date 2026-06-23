import { Tooltip } from '@mui/material';
import PictureInPictureAltIcon from '@mui/icons-material/PictureInPictureAlt';
import { useTranslation } from 'react-i18next';
import ToolbarButton from '../../../components/MeetingRoom/ToolbarButton';
import usePictureInPicture from '../../hooks/usePictureInPicture';
import { env } from '../../../env';
import './index.css';

const PictureInPictureButton = ({ className }: { className?: string }) => {
  const { t } = useTranslation();
  const { isPipActive, togglePip } = usePictureInPicture();
  const title = isPipActive ? t('pip.state.off') : t('pip.state.on');

  if (!env.ALLOW_PICTURE_IN_PICTURE || !('documentPictureInPicture' in window)) {
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
        }}
      />
    </Tooltip>
  );
};

export default PictureInPictureButton;
