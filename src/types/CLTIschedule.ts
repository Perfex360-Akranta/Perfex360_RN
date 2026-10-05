export interface ClitCalendarSavePayload {
    activity: string[];
    cellId: string;
    machineId: string;
    shiftId: string;
    status: string;
    observation: string;
    tagClass: string;
    createdBy: string;
}

export interface ClitCalendarSaveResult {
    result?: string;
    message?: string;
}

export interface ClitCalendarSaveResponse {
    stnd?: ClitCalendarSaveResult;
}

export interface ClitCalendarEnsurePayload {
    factoryId: string;
    sectionId: string;
    cellId: string;
    machineId: string;
}

export interface ClitCalendarEnsureResult {
    result?: string;
    message?: string;
    checkMachineExist?: boolean;
}

export interface ClitCalendarEnsureResponse {
    stnd?: ClitCalendarEnsureResult;
}