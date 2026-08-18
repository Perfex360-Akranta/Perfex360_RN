import { post } from "../axiosService";

export const saveAbnormality = async (data:any) => {
  try {

    const responseData = await post(`abnormality`,data);

    return responseData;
  } catch (error) {
    throw error;
  }
};

export const UpdateAbnCompletion = async (data:any) => {
  try {
    const responseData = await post(`abnormality/update`,data);

    return responseData;
  } catch (error) {
    throw error;
  }
};

export const UpdateAbnAllocation = async (data:any) => {
  try {
    const responseData = await post(`abnormality/updateAllocation`,data);

    return responseData;
  } catch (error) {
    throw error;
  }
};

