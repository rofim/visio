import type { SubscriberWrapper } from '../../types/session';
import getParticipantDisplayName from '@utils/getParticipantDisplayName';

const compareSubscriberByName = (a: SubscriberWrapper, b: SubscriberWrapper): number => {
  const nameA = getParticipantDisplayName(a.subscriber?.stream);
  const nameB = getParticipantDisplayName(b.subscriber?.stream);
  if (!nameA) return 1;
  if (!nameB) return -1;
  return nameA.localeCompare(nameB);
};

export default compareSubscriberByName;
