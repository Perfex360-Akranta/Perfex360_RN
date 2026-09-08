import { get, post } from '../axiosService';
import { WorkOrderSavePayload } from '../../types/workorder';

export const saveWorkOrderCompletion = async (data: WorkOrderSavePayload) => {
    try {
        const responseData = await post('workOrder/saveWodGrd', data);
        return responseData;
    } catch (error) {
        throw error;
    }
};

export const getEquipmentDetailsByNo = async (equipmentNo: string) => {
    try {
        const responseData = await get(`workOrder/equipment/details/${equipmentNo}`);
        return responseData;
    } catch (error) {
        throw error;
    }
};
