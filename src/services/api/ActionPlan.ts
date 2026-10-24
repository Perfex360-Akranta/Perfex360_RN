import { post } from "../axiosService";

// Backend: POST /api/actionplan/compSave  (expects a LIST of ActionPlanCompDto)
export const UpdateActionPlanCompletion = async (data: any[]) => {
  try {
    const responseData = await post(`actionplan/compSave`, data);

    return responseData;
  } catch (error) {
    throw error;
  }
};