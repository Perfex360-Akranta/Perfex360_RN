import { post } from '../axiosService';

export const getShiftTotalMinutes = async (shiftId: string): Promise<number> => {
  try {
    const response: any = await post('commonFilter/shiftMinutes', { shiftId });
    console.log('SHIFT MINUTES RES:', response);
    const body = response?.data ?? response;
    return Number(body?.totalShifttime) || 0;
  } catch (error) {
    throw error;
  }
};
