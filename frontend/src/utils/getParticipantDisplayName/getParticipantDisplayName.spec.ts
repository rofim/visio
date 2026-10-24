import type { Stream } from '@vonage/client-sdk-video';
import { describe, expect, it } from 'vitest';
import getParticipantDisplayName from './getParticipantDisplayName';

const makeStream = (name: string, data: string): Pick<Stream, 'name' | 'connection'> =>
  ({ name, connection: { data } }) as Pick<Stream, 'name' | 'connection'>;

describe('getParticipantDisplayName', () => {
  it('returns the stream name of a video participant', () => {
    expect(getParticipantDisplayName(makeStream('Dr. Jane DOE', 'Dr. Jane DOE'))).toBe(
      'Dr. Jane DOE'
    );
  });

  it('returns the name stored in the token data of a SIP bridge without stream name', () => {
    const data = JSON.stringify({
      sip: true,
      name: 'Dr. Alice SMITH, par téléphone',
      participant: '1',
    });

    expect(getParticipantDisplayName(makeStream('', data))).toBe('Dr. Alice SMITH, par téléphone');
  });

  it('prefers the token data name over the stream name of a SIP bridge', () => {
    const data = JSON.stringify({ sip: true, name: 'Dr. Alice SMITH, par téléphone' });

    expect(getParticipantDisplayName(makeStream('+33100000000', data))).toBe(
      'Dr. Alice SMITH, par téléphone'
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
