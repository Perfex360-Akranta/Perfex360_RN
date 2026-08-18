import {api} from './axiosInstance';
import {getToken} from '../storage/tokenStorage';
//import {useAuthStore} from '../../store/authStore';

let initialized = false;

export const setupAuthInterceptor = () => {

  if (initialized) {
    return;
  }

  initialized = true;

  // REQUEST INTERCEPTOR
  api.interceptors.request.use(
    async config => {

      const token = await getToken();

      if (token) {
        config.headers.Authorization =
          `Bearer ${token}`;
      }

      console.log(
        'API REQUEST:',
        config.method?.toUpperCase(),
        config.url,
      );

      return config;
    },

    error => {
      return Promise.reject(error);
    },
  );


  // RESPONSE INTERCEPTOR
  api.interceptors.response.use(

    response => {
      console.log(
        'API RESPONSE:',
        response.status,
        response.config.url,
      );

      return response;
    },

    async error => {

      const status = error.response?.status;

      console.log(
        'API ERROR:',
        status,
        error.config?.url,
      );

      if (status === 401) {

        //await useAuthStore.getState().logout();
      }

      return Promise.reject(error);
    },
  );
};