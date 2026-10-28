import { post, get } from '../axiosService';

export const saveOtgCapture = async (data: any) => {
  try {
    const responseData = await post('otgcapture', data);
    return responseData;
  } catch (error) {
    throw error;
  }
};

export const getOtgCaptureById = async (keyid: string) => {
  try {
    const responseData = await get(`otgcapture/${keyid}`);
    return responseData;
  } catch (error) {
    throw error;
  }
};



