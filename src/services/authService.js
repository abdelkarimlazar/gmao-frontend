import api from '../api/axiosConfig';
import {
  extractPayload,
  extractToken,
} from './apiUtils';

export const loginRequest = async (credentials) => {
  const response = await api.post('/Auth/login', null, {
    params: {
      username: credentials.username,
    },
  });

  const payload = extractPayload(response);

  return {
    payload,
    token: extractToken(payload),
  };
};

export const registerRequest = async (registrationData) => {
  const response = await api.post(
    '/Auth/register',
    registrationData
  );

  const payload = extractPayload(response);

  return {
    payload,
    token: extractToken(payload),
  };
};