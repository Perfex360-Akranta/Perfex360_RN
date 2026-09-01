import { post } from '../axiosService';
import { WorkFlowApprovalSavePayload } from '../../types/workflow';

export const saveWorkFlowApproval = async (data: WorkFlowApprovalSavePayload) => {
  try {
    const responseData = await post('workflow/approval/save', data);
    return responseData;
  } catch (error) {
    throw error;
  }
};