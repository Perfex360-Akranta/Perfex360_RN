import { post } from '../axiosService';
import { BreakdownBookingPayload } from '../../types/breakdown';
import { BreakdownAllocationPayload } from '../../types/breakdown';
import { BreakdownCompletionPayload } from '../../types/breakdown';

export const saveBreakdownBooking = async (data: BreakdownBookingPayload) => {
    try {
        const responseData = await post('bdm/mobile/booking/save', data);
        return responseData;
    } catch (error) {
        throw error;
    }
};


export const saveBreakdownAllocation = async (data: BreakdownAllocationPayload) => {
    try {
        const responseData = await post('bdm/mobile/allocation/save', data);
        return responseData;
    } catch (error) {
        throw error;
    }
};





export const saveBreakdownCompletion = async (data: BreakdownCompletionPayload) => {
    try {
        const responseData = await post('bdm/mobile/completion/save', data);
        return responseData;
    } catch (error) {
        throw error;
    }
};