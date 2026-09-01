export interface workFlowGridParams {
  flid: string;
  refId: string;
  refType: string;
  employeeId?: string;
  transCode: string;
  roleId?: string;
  enable?: string;
}
export interface GenTlWorkFlowInfoPayload {
  keyid?: string;
  wrml_keyid: string;
  ref_id: string;
  ref_type: string;
  role_id: string;
  status: string;
  employee_id: string;
  date: string;
  remarks: string;
  wrkd_keyid: string;
  tempfield2: string;
  tempfield3: string;
  tempfield4: string;
  tempfield5: string;
  createdby: string;
  createdon: string;
  modifiedon: string;
}

export interface WorkFlowApprovalSavePayload {
  workFlowInfo: GenTlWorkFlowInfoPayload;
  lastLevel: string | null;
  nextRoleName: string;
  nextRoleId: string;
  nextEmpId: string;
}
