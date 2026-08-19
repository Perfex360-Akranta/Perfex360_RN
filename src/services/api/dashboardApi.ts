import {  get } from "../axiosService";


export interface DashboardParams {
  flid: string;
  fromDate: string;
  toDate: string;
}

const dashboardUrl = `abnormality/dmt-dashboard`;

export const getLevelCounts = async (
  params: DashboardParams,
) => {

const response = await get( `${dashboardUrl}/level-counts`,params);
  return response;
};

export const getEmployeeCount = async (
  params: DashboardParams,
) => {

  const response = await get( `${dashboardUrl}/employee-count`,params);

  return response;
};

export const getTransactionSummary = async (
  params: DashboardParams,
) => {

const response = await get( `${dashboardUrl}/transaction-summary`,params);

  return response;
};

export const getTrainingSummary = async (
  params: DashboardParams,
) => {

  const response = await get( `${dashboardUrl}/training-summary`,params);


  return response;
};

export const getAbnormalityClosure = async (
  params: DashboardParams,
) => {

const response = await get( `${dashboardUrl}/abnormality-closure-chart`,params);

  return response;
};

export const getLossAnalysis = async (
  params: DashboardParams,
) => {

const response = await get( `${dashboardUrl}/loss-analysis`,params);

  return response;
};

export const getActionPlanClosure = async (
  params: DashboardParams,
) => {

const response = await get( `${dashboardUrl}/action-plan-closure-chart`,params);

  return response;
};

export const getAttendanceGauge = async (
  params: DashboardParams,
) => {

  const response = await get( `${dashboardUrl}/attendance-gauge`,params);


  return response;
};

export const getKaizenBenefitTrend = async (
  params: DashboardParams,
) => {

const response = await get( `${dashboardUrl}/kaizen-benefit-trend`,params);

  return response;
};


export const loadDmtDashboard = async (
  params: DashboardParams,
) => {

  const [
    levelCounts,
    employeeCount,
    transactionSummary,
    trainingSummary,
    abnormalityClosure,
    lossAnalysis,
    actionPlanClosure,
    attendanceGauge,
    kaizenBenefitTrend,
  ] = await Promise.all([

    getLevelCounts(params),

    getEmployeeCount(params),

    getTransactionSummary(params),

    getTrainingSummary(params),

    getAbnormalityClosure(params),

    getLossAnalysis(params),

    getActionPlanClosure(params),

    getAttendanceGauge(params),

    getKaizenBenefitTrend(params),
  ]);

  return {
    levelCounts,
    employeeCount,
    transactionSummary,
    trainingSummary,
    abnormalityClosure,
    lossAnalysis,
    actionPlanClosure,
    attendanceGauge,
    kaizenBenefitTrend,
  };
};