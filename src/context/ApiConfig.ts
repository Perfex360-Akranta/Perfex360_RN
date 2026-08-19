import type {AxiosInstance} from 'axios';

let apiIp = '10.224.173.148';
let apiPort = '9090';
let apiApp = '';

let apiInstance: AxiosInstance | null = null;

export const registerApiInstance = (instance: AxiosInstance) => {
  apiInstance = instance;

  // Set the initial URL
  apiInstance.defaults.baseURL = getApiUrl();

  console.log('Axios initial URL:', apiInstance.defaults.baseURL);
};


export const setApiConfig = (ip: string, port: string, app: string) => {
  apiIp = ip;
  apiPort = port;
  apiApp = app?.trim() ?? '';

   const newUrl = getApiUrl();

  console.log('API CONFIG UPDATED:', newUrl);

  if (apiInstance) {
    apiInstance.defaults.baseURL = newUrl;

    console.log(
      'Axios baseURL UPDATED:',
      apiInstance.defaults.baseURL,
    );
  }
};

export const getApiUrl = () => {
  const appPath = apiApp ? `/${apiApp}` : '';
  return `http://${apiIp}:${apiPort}${appPath}/api`;
};