import AsyncStorage from '@react-native-async-storage/async-storage';

const API_IP = 'API_IP';
const API_PORT = 'API_PORT';

export const saveApiConfig = async (
  ip: string,
  port: string,
  app: string,
) => {
 
   await AsyncStorage.setItem('API_IP', ip);
  await AsyncStorage.setItem('API_PORT', port);
  await AsyncStorage.setItem('API_APP', app);
};

export const getApiConfig = async () => {

  const ip = await AsyncStorage.getItem('API_IP');
  const port = await AsyncStorage.getItem('API_PORT');
  const app = await AsyncStorage.getItem('API_APP');

  return {
    ip: ip ?? '10.224.173.148',
    port: port ?? '9090',
    app: app?.trim() ?? '',
  };
};

export const clearApiConfig = async () => {
  await AsyncStorage.removeMany([API_IP, API_PORT]);
};