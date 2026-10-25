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

/** Vonage does not document the stream name of a SIP call, the API puts the phone user's name in the bridge token */
export default (stream?: Pick<Stream, 'name' | 'connection'>): string =>
  getSipBridgeName(stream?.connection?.data) ?? stream?.name ?? '';
