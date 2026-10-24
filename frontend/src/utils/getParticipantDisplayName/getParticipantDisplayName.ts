import type { Stream } from '@vonage/client-sdk-video';

const getSipBridgeName = (data?: string): string | undefined => {
  try {
    const tokenData = JSON.parse(data ?? '') as { sip?: unknown; name?: unknown } | null;
    return tokenData?.sip === true && typeof tokenData.name === 'string'
      ? tokenData.name
      : undefined;
  } catch {
    return undefined;
  }
};

/**
 * Returns the name displayed for a participant: for a SIP bridge carrying a phone user, the name the API stored
 * in the token data of the bridge, since Vonage does not document the stream name of a SIP call, otherwise its
 * stream name.
 * @param {Stream} stream - The stream of the participant.
 * @returns {string} The participant name, empty when unknown.
 */
export default (stream?: Pick<Stream, 'name' | 'connection'>): string =>
  getSipBridgeName(stream?.connection?.data) ?? stream?.name ?? '';
