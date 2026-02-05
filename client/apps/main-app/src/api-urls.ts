import { environments } from './environments';

const BACKEND_URL = environments.backendAPiUrl;

export const AuthApiUrls = {
  SIGNUP: BACKEND_URL + '/auth/signup',
  SIGNIN: BACKEND_URL + '/auth/signin',
};
