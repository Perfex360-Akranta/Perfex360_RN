export interface Column {
  key: string;
  label: string;
  type: string;
};


export interface ColumnFilter {
  id: number;
  columnKey: string;
  columnName: string;
  columnType: string;
  condition: string;
  value: string;
};
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
};

 export interface DynamicGridProps {
  procedureName: string;

  conditionParams?: Record<string, any>;

  commonParams?: Record<string, any>;

  footer?: boolean;

  onRowPress?: (row: any) => void;

  isEdit? : boolean;

  onEdit?: (record : GridEditProps) => void;

  editCondition?: (item: any) => boolean;

  formatField?: CardFormatMethod;

};

export interface GridEditProps {
   row: any,
   meta: any,
   header: any,
   index:Number,
   prevRow:any,
   nextRow:any,
};

export interface ApiRow {
  [key: string]: any;
};

export type CardFieldFormat = {
  text?: string;
  textColor?: string;
  backgroundColor?: string;
  icon?: string;
  iconColor?: string;
  showIcon?: boolean;
};

export type CardFormatMethod = (
  key: string,
  value: any,
  item: ApiRow
) => CardFieldFormat | undefined;

export type CardItemProps = {
  item: ApiRow;
  index: number;
  formatField?: CardFormatMethod;
};