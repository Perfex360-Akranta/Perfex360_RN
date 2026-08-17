import { save } from "./axiosService";

export const functionCall = async (functionName:string,data:any) => {
  try {
    const responseData = await save(`db/callFunction/${functionName}`,data);

    return responseData;
  } catch (error) {
    throw error;
  }
};
// const buildConditionParam() {
//   const params: string[] = [];

//   params.push('FLID=FNL000000001');
//   params.push('FROMDATE=01-Jan-1801');
//   params.push('TODATE=31-Dec-2100');
//   params.push('FROMMONTH=Mar-2012');
//   params.push('TOMONTH=Jun-2026');
//   params.push('ISMONTHWISE=Y');
//   params.push('DRILLFLAG= ');
//   params.push('ELEMENTID=CMP0000001');
//   params.push('ROLELEVELNO=10000');

//   // Tag Class filter
//   // Example: TAG000002 for Red Tag
//   params.push(`TAGID=${this.selectedTagClass || ''}`);

//   params.push('STATUS=P');
//   params.push('ABNVIEWTYPE=I');
//   params.push('DETECTEDBY=EMP00001');
//   params.push('EXCEL=NOEXCEL');
//   params.push('STATUSNEW=null');

//   return params.join(';') + ';';
// }

// private buildCommonParam(): string {
//   const fromRow = ((this.currentPage - 1) * this.pageSize) + 1;
//   const toRow = this.currentPage * this.pageSize;

//   const params: string[] = [];

//   params.push('FILTERCOND=');
//   params.push('ISTOTALCNT=Y');
//   params.push(`FROMTOROW=${fromRow} AND ${toRow}`);
//   params.push(`GRIDFILTER=${this.gridFilter || ''}`);
//   params.push('ISGETCOL=N');

//   return params.join(';') + ';';
// }