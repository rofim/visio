import CallEndIcon from '@mui/icons-material/CallEnd';
import Tooltip from '@mui/material/Tooltip';
import { useNavigate } from 'react-router-dom';
import { ReactElement } from 'react';
import ToolbarButton from '../ToolbarButton';
import useRoomName from '../../../hooks/useRoomName';

export type ExitButtonProps = {
  handleLeave: () => void;
  closeTabOnExit?: boolean;
};

/**
 * ExitButton Component
 *
 * This component provides a button for the user to exit the meeting.
 * @param {ExitButtonProps} props - the props for the component
 *  @property {() => void} handleLeave - a function that handles the leave action.
 *  @property {boolean} closeTabOnExit - close the current tab instead of navigating to goodbye (default: false)
 * @returns {ReactElement} The exit button component
 */
const ExitButton = ({ handleLeave, closeTabOnExit = false }: ExitButtonProps): ReactElement => {
  const navigate = useNavigate();
  const roomName = useRoomName();

  const handleExit = () => {
    handleLeave();

    if (closeTabOnExit) {
      // Fermer l'onglet directement
      window.close();
      // Fallback si window.close() ne fonctionne pas
      if (!window.closed) {
        window.location.href = 'about:blank';
      }
    } else {
      // Comportement par défaut : naviguer vers /goodbye
      navigate('/goodbye', { state: { roomName } });
    }
  };

  return (
    <Tooltip title="Exit meeting" aria-label="exit">
      <ToolbarButton
        onClick={handleExit}
        sx={{
          backgroundColor: 'rgb(239 68 68)',
          '&:hover': {
            backgroundColor: 'rgba(234, 67, 53, 0.8)',
          },
          marginRight: '0px',
        }}
        icon={<CallEndIcon className="text-white" />}
      />
    </Tooltip>
  );
};

export default ExitButton;
