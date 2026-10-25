import type { Stream } from '@vonage/client-sdk-video';
import i18n from 'i18next';
import { beforeAll, describe, expect, it } from 'vitest';
import getParticipantDisplayName, { getParticipantName } from './getParticipantDisplayName';

const makeStream = (name: string, data: string): Pick<Stream, 'name' | 'connection'> =>
  ({ name, connection: { data } }) as Pick<Stream, 'name' | 'connection'>;

const sipBridgeData = (name: string) => JSON.stringify({ sip: true, name });

describe('getParticipantDisplayName', () => {
  beforeAll(() => {
    i18n.addResourceBundle(i18n.language, 'translation', {
      'participant.byPhone': '{{name}}, par téléphone',
    });
  });

  it('returns the stream name of a video participant', () => {
    expect(getParticipantDisplayName(makeStream('Dr. Jane DOE', 'Dr. Jane DOE'))).toBe(
      'Dr. Jane DOE'
    );
  });

  it('adds the translated phone mention to the name stored in the SIP bridge token', () => {
    expect(getParticipantDisplayName(makeStream('', sipBridgeData('Dr. Alice SMITH')))).toBe(
      'Dr. Alice SMITH, par téléphone'
    );
  });

  it('prefers the token data name over the stream name of a SIP bridge', () => {
    expect(
      getParticipantDisplayName(makeStream('+33100000000', sipBridgeData('Dr. Alice SMITH')))
    ).toBe('Dr. Alice SMITH, par téléphone');
  });

  it('does not escape the name of a phone participant', () => {
    expect(getParticipantDisplayName(makeStream('', sipBridgeData("Dr. Sean O'BRIEN")))).toBe(
      "Dr. Sean O'BRIEN, par téléphone"
    );
  });

  it('ignores token data that is not a SIP bridge', () => {
    expect(
      getParticipantDisplayName(makeStream('Dr. Jane DOE', JSON.stringify({ name: 'Someone' })))
    ).toBe('Dr. Jane DOE');
    expect(getParticipantDisplayName(makeStream('', JSON.stringify({ name: 'Someone' })))).toBe('');
    expect(getParticipantDisplayName(makeStream('', 'not json'))).toBe('');
  });

  it('returns an empty name without stream', () => {
    expect(getParticipantDisplayName(undefined)).toBe('');
  });
});

describe('getParticipantName', () => {
  it('returns the bare name of a phone participant, for its initials', () => {
    expect(getParticipantName(makeStream('', sipBridgeData('Dr. Alice SMITH')))).toBe(
      'Dr. Alice SMITH'
    );
  });

  it('returns the stream name of a video participant', () => {
    expect(getParticipantName(makeStream('Dr. Jane DOE', 'Dr. Jane DOE'))).toBe('Dr. Jane DOE');
  });
});
