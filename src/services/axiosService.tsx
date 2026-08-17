import axios from 'axios';
import { getApiUrl } from '../context/ApiConfig';

//const API_URL = 'http://10.0.2.2:9090/api';192.168.0.4
//const API_URL = 'http://10.224.173.148:9090/api';
const API_URL = getApiUrl();


export const getDropdownData1:any = async (
  endpoint: string,
  params?: any,
) => {

     const url = `${getApiUrl()}/${endpoint}`;
let response : any = '' ;
  console.log('URL:', url);
  console.log('PARAMS:', params);

  if(params != null){
       response = await axios.get(
    `${getApiUrl()}/${endpoint}`,
    {
      params,
    },
  );
  }else{
    response = await axios.get(
    `${getApiUrl()}/${endpoint}`,
   
  );
  }
  console.log('STATUS:', response.status);
  console.log('DATA:', response.data);

  return response.data;
};

export const getDropdownData:any = async (
  endpoint: string,
  params?: any,
) => {

     const url = `${getApiUrl()}/${endpoint}`;
let response : any = '' ;
  console.log('URL:', url);
  console.log('PARAMS:', params);

  if(params != null){
       response = await axios.post(
    `${getApiUrl()}/${endpoint}`,
      params,
      {
        headers: {
          'Content-Type': 'application/json',
        },

      }
  );
  }else{
    response = await axios.post(
    `${getApiUrl()}/${endpoint}`,
   
  );
  }
  console.log('STATUS:', response.status);
  console.log('DATA:', response.data);

  return response.data;
};

export const getData = async (
  endpoint: string,
  params?: any,
) => {

     const url = `${getApiUrl()}/${endpoint}`;
let response : any = '' ;
  console.log('URL:', url);
  console.log('PARAMS:', params);

  if(params != null){
       response = await axios.get(
    `${API_URL}/${endpoint}`,
    {
      params,
    },
  );
  }else{
    response = await axios.get(
    `${getApiUrl()}/${endpoint}`,
   
  );
  }
  console.log('STATUS:', response.status);
  console.log('DATA:', response.data);

  return response.data;
};

export const save = async ( endpoint: string,data:any) => {
  try {
    const url = `${getApiUrl()}/${endpoint}`;
    const response = await axios.post(
      url,
      data,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data;
  } catch (error) {
    throw error;
  }
};

export const authPost = async ( endpoint: string,data:any) => {
  try {
    const url = `${getApiUrl()}/${endpoint}`;
    const response = await axios.post(
      url,
      data,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data;
  } catch (error) {
    throw error;
  }
};

export const authGet = async ( endpoint: string,id:string) => {
  try {
    const url = `${getApiUrl()}/${endpoint}/${id}`;
    const response = await axios.get(url);

    return response.data;
  } catch (error) {
    throw error;
  }
};