import { api ,authApi } from '../services/axios/axiosInstance';

let apiIp = '10.224.173.148';
let apiPort = '9090';
let apiApp = '';




export const setApiConfig = (ip: string, port: string, app: string) => {
  apiIp = ip;
  apiPort = port;
  apiApp = app?.trim() ?? '';

   const newUrl = getApiUrl();

  console.log('API CONFIG UPDATED:', newUrl);

  api.defaults.baseURL = newUrl;
  authApi.defaults.baseURL = newUrl;


};

export const getApiUrl = () => {
  const appPath = apiApp ? `/${apiApp}` : '';
  return `http://${apiIp}:${apiPort}${appPath}/api`;
};