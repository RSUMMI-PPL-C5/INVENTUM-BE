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
    completed: number;
    on_progress: number;
    pending: number;
    total: number;
  };
}

// Plan report interfaces
export interface PlanReportFilterOptions {
  search?: string;
  status?: "all" | "scheduled" | "pending";
  startDate?: string | Date;
  endDate?: string | Date;
  type?: "MAINTENANCE" | "CALIBRATION" | "all";
}

// Result report interfaces
export interface ResultReportFilterOptions {
  search?: string;
  result?: "all" | "success" | "success-with-notes" | "failed-with-notes";
  startDate?: string | Date;
  endDate?: string | Date;
  type?: "MAINTENANCE" | "CALIBRATION" | "PARTS" | "all";
}

// Response summary interface
export interface SummaryReportFilterOptions {
  search?: string;
  type?: "all" | "MAINTENANCE" | "CALIBRATION";
  startDate?: string | Date;
  endDate?: string | Date;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ReportResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface CountReport {
  maintenanceCount: number;
  calibrationCount: number;
  sparePartsCount: number;
  maintenancePercentageChange: number;
  calibrationPercentageChange: number;
  sparePartsPercentageChange: number;
}
