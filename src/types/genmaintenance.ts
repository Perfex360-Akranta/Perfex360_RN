export interface GenmaintenanceBookingPayload {
    machineid: string;
    flid: string;
    shiftdate: string;
    shift: string;
    occureddate: string;
    occurredTime?: string;
    stationid?: string;
    partlocation?: string;
    activitytype: string;
    trade: string;
    mchcondition?: string;
    isSpares: 'Y' | 'N' | 'W';
    problem: string;
    action?: string;
    rootcause?: string;
    countermeasure?: string;
    status?: string;
    targetdate?: string;
    priority: string;
    workhours?: number;
    downtime?: number;
    responsetime?: number;
    bookedby: string;
    roleid?: string;
}

export interface GenmaintenanceBookingResponse {
    keyid?: string;
    machineid?: string;
    flid?: string;
    status?: string;
    refdocid?: string;
}

export interface GenmaintenanceCompletionPayload {
    keyid: string;
    wno?: string;
    completedby: string;
    wostartdate: string;
    woenddate: string;
    completeddate?: string;
    remarks?: string;
}