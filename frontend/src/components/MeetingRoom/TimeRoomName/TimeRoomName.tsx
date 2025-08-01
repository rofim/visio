import { ReactElement } from 'react';
import useDateTime from '../../../hooks/useDateTime';
import useRoomName from '../../../hooks/useRoomName';

interface TimeRoomNameProps {
  showRoomName?: boolean;
}

/**
 *  TimeRoomName Component
 *
 *  This component shows the current time and room name.
 * @param {TimeRoomNameProps} props - Component props
 * @returns {ReactElement} - The Time and Room Name component.
 */
const TimeRoomName = ({ showRoomName = true }: TimeRoomNameProps = {}): ReactElement => {
  const { time } = useDateTime();
  const roomName = useRoomName();

  const displayParts = [time];

  if (showRoomName) {
    displayParts.push(roomName);
  }

  return (
    <div className="ml-3 mt-1 truncate font-normal text-white">{displayParts.join(' | ')}</div>
  );
};

export default TimeRoomName;
