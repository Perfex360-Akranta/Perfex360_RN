import AsyncStorage from '@react-native-async-storage/async-storage';
//import {User} from '../../types/auth';

const USER_KEY = '@perfex_user';

export const saveUser = async (
  user: any,
): Promise<void> => {
  await AsyncStorage.setItem(
    USER_KEY,
    JSON.stringify(user),
  );
};

export const getUser = async (): Promise<any | null> => {
  const value = await AsyncStorage.getItem(USER_KEY);

  if (!value) {
    return null;
  }

  return JSON.parse(value);
};

export const removeUser = async (): Promise<void> => {
  await AsyncStorage.removeItem(USER_KEY);
};