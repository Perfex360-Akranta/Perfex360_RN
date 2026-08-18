import { post, get } from '../axiosService';

export const saveSuggestion = async (data: any) => {
  try {
    const responseData = await post('kznbnk/save', data);
    return responseData;
  } catch (error) {
    throw error;
  }
};

export const getSuggestionById = async (keyid: string) => {
  try {
    const responseData = await get(`kznbnk/getById/${keyid}`);
    return responseData;
  } catch (error) {
    throw error;
  }
};

