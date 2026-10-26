import { post } from "../axiosService";
import {api} from './../axios/axiosInstance';

export interface SuggestionImage {
  uri: string;
  name: string;
  type: string;
}

// TODO: no backend endpoint exists yet. Confirm the real path with the backend team.
export const uploadSuggestionImage = async (
  keyid: string,
  image: SuggestionImage,
  refDocType: string,
  imageType: string,
) => {
  try {
    console.log('Selected image:', image);
    // console.log('Image size in bytes:', image.fileSize);   
    const formData = new FormData();
    formData.append('file', { uri: image.uri, name: image.name, type: image.type } as any);
    formData.append('refKeyId', keyid);
    formData.append('refDocType', refDocType);
    formData.append('imageType', imageType);

    const responseData = await post('auth/images', formData);

    return responseData;
  } catch (error) {
    throw error;
  }
};

export const getSuggestionImage = async (
  refKeyId: string,
  refDocType: string,
  imageType: string,
) => {
  const response = await api.get('auth/images/view', {
    params: {
      refKeyId,
      refDocType,
      imageType,
    },
    responseType: 'arraybuffer',
  });

  return response.data;
};