import i18n from 'i18next';
import { beforeAll, describe, it, expect } from 'vitest';
import getFilteredSubscribers from './getFilteredSubscribers';
import type { SubscriberWrapper } from '../../types/session';

const makeWrapper = (
  name: string | undefined,
  id: string,
  isScreenshare = false,
  connectionData = ''
): SubscriberWrapper => {
  return {
    id,
    isScreenshare,
    isPinned: false,
    element: {} as unknown as HTMLVideoElement,
    subscriber: {
      stream: { name, connection: { data: connectionData } },
    } as unknown as SubscriberWrapper['subscriber'],
  } as SubscriberWrapper;
};

const makeSipBridgeWrapper = (name: string, id: string): SubscriberWrapper =>
  makeWrapper('', id, false, JSON.stringify({ sip: true, name }));

describe('getFilteredSubscribers', () => {
  beforeAll(() => {
    i18n.addResourceBundle(i18n.language, 'translation', {
      'participant.byPhone': '{{name}}, par téléphone',
    });
  });

  it('filters out screenshares and applies name match', () => {
    const data: SubscriberWrapper[] = [
      makeWrapper('Bob', '1'),
      makeWrapper('Alice', '2'),
      makeWrapper('Charlie', '3', true),
    ];

    const nameMatches = (n: string) => n.toLowerCase().includes('a');
    const result = getFilteredSubscribers({ subscriberWrappers: data, nameMatches });

    expect(result.map((w) => w.subscriber?.stream?.name)).toEqual(['Alice']);
  });

  it('sorts remaining by name ascending', () => {
    const data: SubscriberWrapper[] = [
      makeWrapper('Charlie', '3'),
      makeWrapper('Bob', '1'),
      makeWrapper('Alice', '2'),
    ];

    const result = getFilteredSubscribers({ subscriberWrappers: data });
    expect(result.map((w) => w.subscriber?.stream?.name)).toEqual(['Alice', 'Bob', 'Charlie']);
  });

  it('finds and sorts a phone participant by the name of its SIP bridge', () => {
    const data: SubscriberWrapper[] = [
      makeWrapper('Charlie', '3'),
      makeSipBridgeWrapper('Bernard', '4'),
      makeWrapper('Alice', '2'),
    ];

    const sorted = getFilteredSubscribers({ subscriberWrappers: data });
    expect(sorted.map((w) => w.id)).toEqual(['2', '4', '3']);

    const nameMatches = (n: string) => n.toLowerCase().includes('bern');
    const found = getFilteredSubscribers({ subscriberWrappers: data, nameMatches });
    expect(found.map((w) => w.id)).toEqual(['4']);
  });
});
