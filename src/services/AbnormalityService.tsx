import { save } from "./axiosService";

export const saveAbnormality = async (data:any) => {
  try {
    const responseData = await save(`abnormality`,data);

    return responseData;
  } catch (error) {
    throw error;
  }
};

export const UpdateAbnCompletion = async (data:any) => {
  try {
    const responseData = await save(`abnormality/update`,data);

    return responseData;
  } catch (error) {
    throw error;
  }
};

export const UpdateAbnAllocation = async (data:any) => {
  try {
    const responseData = await save(`abnormality/updateAllocation`,data);

    return responseData;
  } catch (error) {
    throw error;
  }
};

// export default {
//   saveAbnormality
// };