export interface MonthlyTypeCount {
  MAINTENANCE: number;
  CALIBRATION: number;
}

export interface MonthlyDataRecord {
  month: string;
  MAINTENANCE: number;
  CALIBRATION: number;
}

export interface RequestStatusCount {
  status: string;
  count: number;
  percentage: number;
}

export interface RequestStatusReport {
  MAINTENANCE: RequestStatusCount[];
  CALIBRATION: RequestStatusCount[];
  total: {
    success: number;
    warning: number;
    failed: number;
    total: number;
  };
}
