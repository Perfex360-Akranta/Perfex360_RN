export interface WorkOrderFeedback {
    feedbackid?: string;
    wodetailid?: string;
    feedbackdate?: string;
    status: string;
    action?: string;
    startdate?: string;
    enddate?: string;
    completeddate?: string;
    duration?: string;
    isprodstopped?: string;
    prodstartdate?: string;
    currentreading?: string;
    adjustedreading?: string;
    uom?: string;
    whywhyflag?: string;
    whywhyid?: string;
    amcflag?: string;
    amcdetailid?: string;
    spareflag?: string;
    sparecost?: string;
    manpowercost?: string;
    contractorcost?: string;
    othercost?: string;
    observation?: string;
    feedback?: string;
    completedby?: string;
    rescheduleflag?: string;
    reschedulereason?: string;
    nextinspectiondate?: string;
    remarks?: string;
    rootcause?: string;
    countermeasure?: string;
    mchcondition?: string;
    machinetakeovertime?: string;
    createdby?: string;
    modifiedon?: string;
    createdon?: string;
    roleid?: string;
}

export interface WorkOrderFeedbackEntry {
    feedback: WorkOrderFeedback;
    obsvResponsibility?: string;
    obsvTargetDate?: string;
    cbmReading?: string | null;
    cbmNextDueDate?: string;
    cbmMinReading?: string | null;
    cbmMaxReading?: string | null;
    cbmAdjustedReading?: string;
    spareconsumed?: any;
    sparecostactual?: any;
}

export interface WorkOrderSavePayload {
    feedbackList: WorkOrderFeedbackEntry[];
    workOrderDetailsLstBean: { pmCalendarId?: string }[];
    multipleResps: any[];
    pmStdId?: string | null;
}