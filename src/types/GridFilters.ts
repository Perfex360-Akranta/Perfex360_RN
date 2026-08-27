export interface Column {
  key: string;
  label: string;
  type: string;
}


export interface ColumnFilter {
  id: number;
  columnKey: string;
  columnName: string;
  columnType: string;
  condition: string;
  value: string;
}
export interface GridFilterProps {
  companyId?: string;
  locationId?: string;
  sbuId?: string;
  pbuId?: string ;
  sectionId?: string;
  cellId?: string;
  machineId?: string;
  flid: string;
  elementId?:string;
  monthWise?:string;
  fromDate?: Date | null;
  toDate?:Date | null;
  fromMonth?: Date | null;
  toMonth?: Date | null;

  columnFilters?: ColumnFilter[];

  conditionParams?:any;
  reload? : Date | null;
}

 export interface DynamicGridProps {
  procedureName: string;

  conditionParams?: Record<string, any>;

  commonParams?: Record<string, any>;

  footer?: boolean;

  onRowPress?: (row: any) => void;

  isEdit? : boolean;

  onEdit?: (
        row: any,
        meta: any,
        header: any
    ) => void;
}