import { post , get } from "../axiosService";

export const getDropdownData:any = async (
  endpoint: string,
  params?: any,
) => {

  const response = await post(endpoint,params);

  return response;

};

export const getDropdownData1:any = async (
  endpoint: string,
  params?: any,
) => {

  const response = await get(endpoint,params);

  return response;
  
};