import { ReactElement } from 'react';
import useDateTime from '../../../hooks/useDateTime';

/**
 *  TimeRoomName Component
 *
 *  This component shows the current time and room name.
 * @returns {ReactElement} - The Time and Room Name component.
 */
const TimeRoomName = (): ReactElement => {
  const { time } = useDateTime();

  return <div className="ml-3 mt-1 truncate font-normal text-white">{time}</div>;
};

export default TimeRoomName;
