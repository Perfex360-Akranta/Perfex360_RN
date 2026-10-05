import { post } from '../axiosService';
import {
    ClitCalendarSavePayload,
    ClitCalendarSaveResponse,
    ClitCalendarEnsurePayload,
    ClitCalendarEnsureResponse,
} from '../../types/CLTIschedule';

export const saveClitSchedule = async (
    data: ClitCalendarSavePayload,
): Promise<ClitCalendarSaveResponse> => {
    try {
        return await post('clit/mobile/schedule/save', data);
    } catch (error) {
        throw error;
    }
};

export const ensureClitCalendar = async (
    data: ClitCalendarEnsurePayload,
): Promise<ClitCalendarEnsureResponse> => {
    try {
        return await post('clit/mobile/schedule/calendar/ensure', data);
    } catch (error) {
        throw error;
    }
};