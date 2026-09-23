export interface BreakdownBookingPayload {
    machineid: string;
    flid: string;
    problemDescription: string;
    priority: string;
    occurredOn: string;
    assemblyid: string;
    subassemblyid?: string;
    bookedby: string;
    roleid?: string;
}

export interface BreakdownBookingResponse {
    master?: {
        keyid?: string;
        wno?: string;
        machineid?: string;
        flid?: string;
        status?: string;
    };
    detail?: {
        keyid?: string;
        bdms_keyid?: string;
    };
    womWorkOrder?: {
        keyid?: string;
    };
}

export interface BreakdownAllocationPayload {
    keyid: string;
    wno?: string;
    sectionid: string;
    startdate: string;
    enddate: string;
    bookedby: string;
}

export interface BreakdownCompletionPayload {
    keyid: string;
    wno?: string;
    completedby: string;
    completeddate: string;
}