import { post } from "../axiosService";

export interface SuggestionImage {
  uri: string;
  name: string;
  type: string;
}

// TODO: no backend endpoint exists yet. Confirm the real path with the backend team.
export const uploadSuggestionImage = async (
  keyid: string,
  image: SuggestionImage,
  createdBy: string,
) => {
  try {
    const formData = new FormData();
    formData.append('file', { uri: image.uri, name: image.name, type: image.type } as any);
    formData.append('keyid', keyid);
    formData.append('createdBy', createdBy);

    const responseData = await post(`kaizen/suggestion/image`, formData);

    return responseData;
  } catch (error) {
    throw error;
  }
};