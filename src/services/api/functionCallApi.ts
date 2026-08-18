import { post } from "../axiosService";

export const functionCall = async (functionName:string,data:any) => {
  try {
    const responseData = await post(`db/callFunction/${functionName}`,data);

    return responseData;
  } catch (error) {
    throw error;
  }
};
