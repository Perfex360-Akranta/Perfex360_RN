import {api,authApi} from './axios/axiosInstance';


// GET
export const get = async (
  endpoint: string,
  params?: any,
  id? : string | number ,
) => {

  const url = id != null ? `${endpoint}/${id}` : endpoint;
  const response = await api.get(
    url,
    params != null
      ? {params}
      : undefined,
  );

  return response.data;
};



// GET WITH ID
export const getById = async (
  endpoint: string,
  id: string | number,
) => {

  const response = await api.get(
    `${endpoint}/${id}`,
  );

  return response.data;
};



// POST
export const post = async (
  endpoint: string,
  data?: any,
) => {

  const response = await api.post(
    endpoint,
    data,
  );

  return response.data;
};


// PUT
export const put = async (
  endpoint: string,
  data?: any,
) => {

  const response = await api.put(
    endpoint,
    data,
  );

  return response.data;
};


// DELETE
export const remove = async (
  endpoint: string,
  params?: any,
) => {

  const response = await api.delete(
    endpoint,
    params != null
      ? {params}
      : undefined,
  );

  return response.data;
};


export const authPost = async ( endpoint: string,data?:any) => {
  try {
    const response = await authApi.post(
    endpoint,
    data,
  );

    return response.data;
  } catch (error) {
    throw error;
  }
};

export const authGet = async ( endpoint: string,params?:any,id?:string | number) => {
  try {
    
  const url = id != null ? `${endpoint}/${id}` : endpoint;
  const response = await authApi.get(
    url,
    params != null
      ? {params}
      : undefined,
  );

  return response.data;
  } catch (error) {
    throw error;
  }
};