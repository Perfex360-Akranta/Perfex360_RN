import { post } from '../axiosService';
import {
    GenmaintenanceBookingPayload,
    GenmaintenanceBookingResponse,
    GenmaintenanceCompletionPayload,
} from '../../types/genmaintenance';

export const saveGeneralMaintenanceBooking = async (
    data: GenmaintenanceBookingPayload,
): Promise<GenmaintenanceBookingResponse> => {
    try {
        const responseData = await post('genmaintenance/mobile/booking/save', data);
        return responseData;
    } catch (error) {
        throw error;
    }
};

export const saveGeneralMaintenanceCompletion = async (
    data: GenmaintenanceCompletionPayload,
) => {
    try {
        return await post('genmaintenance/mobile/completion/save', data);
    } catch (error) {
        throw error;
    }
};
