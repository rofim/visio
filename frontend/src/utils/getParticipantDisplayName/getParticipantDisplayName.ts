import type { Stream } from '@vonage/client-sdk-video';
import i18n from 'i18next';

type ParticipantStream = Pick<Stream, 'name' | 'connection'>;

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
export const getParticipantName = (stream?: ParticipantStream): string =>
  getSipBridgeName(stream?.connection?.data) ?? stream?.name ?? '';

export default (stream?: ParticipantStream): string => {
  const sipBridgeName = getSipBridgeName(stream?.connection?.data);

  return sipBridgeName
    ? i18n.t('participant.byPhone', { name: sipBridgeName, interpolation: { escapeValue: false } })
    : (stream?.name ?? '');
};
