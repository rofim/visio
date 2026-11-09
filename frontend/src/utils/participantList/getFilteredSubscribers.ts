import type { SubscriberWrapper } from '../../types/session';
import compareSubscriberByName from './compareSubscriberByName';
import getParticipantDisplayName from '@utils/getParticipantDisplayName';

type NameMatcher = (name: string) => boolean;

type Args = {
  subscriberWrappers: SubscriberWrapper[];
  nameMatches?: NameMatcher;
};

const getFilteredSubscribers = ({ subscriberWrappers, nameMatches }: Args): SubscriberWrapper[] => {
  return subscriberWrappers
    .filter((subscriberWrapper) => {
      if (subscriberWrapper.isScreenshare) return false;

      if (!nameMatches) return true;

      const participantName = getParticipantDisplayName(subscriberWrapper.subscriber?.stream);
      return nameMatches(participantName);
    })
    .sort(compareSubscriberByName);
};

export default getFilteredSubscribers;
