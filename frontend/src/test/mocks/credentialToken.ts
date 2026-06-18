import { setStorageItem } from '@utils/storage';

const FAKE_CREDENTIALS_TOKEN =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbiI6InRva2VuIiwic2Vzc2lvbklkIjoic2Vzc2lvbklkIiwiYXBpS2V5IjoiNDc3MDI4MzEifQ.cqsIzw_o6WmSiFxLmlAT_E1Yra6knw8GJ2X2krLD5x4';

export const initCredentialsToken = () => {
  setStorageItem('token', FAKE_CREDENTIALS_TOKEN);
};
