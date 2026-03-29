import { hrApi } from "./axios-instances";
import type { ApiResponse } from "@/shared/types/api-response";
import type { Staff } from "@/shared/types/staff";

export interface TodayTimekeepingRecord {
  id: string;
  employeeName: string;
  checkInTime: string;
  checkOutTime?: string | null;
  isLate: boolean;
  workHours: number | null;
  warning: string | null;
}

export interface TodayTimekeepingResponse {
  hasCheckedIn: boolean;
  hasCheckedOut: boolean;
  isGpsConfigured: boolean;
  warning: string | null;
  record: TodayTimekeepingRecord | null;
}

export interface UploadSelfieResponse {
  imageUrl: string;
}

/** Kết quả tổng hợp chấm công tháng (BE có thể trả camelCase hoặc snake_case) */
export interface TimekeepingSummary {
  totalEmployees: number | null;
  totalWorkDays: number | null;
  totalWorkHours: number | null;
  totalLateCount: number | null;
}

function normaliseNumber(v: unknown): number | null {
  if (v == null) return null;
  if (typeof v === "number" && !Number.isNaN(v)) return v;
  if (typeof v === "string") {
    const n = Number(v);
    return Number.isNaN(n) ? null : n;
  }
  return null;
}

/** store_role từ BE: Owner | Manager | Staff - dùng filter theo quyền xem */
export interface TimekeepingHistoryRecord {
  id: string;
  employeeId?: string;
  employeeName?: string;
  storeRole?: "Owner" | "Manager" | "Staff";
  checkInTime: string;
  checkOutTime?: string | null;
  isLate?: boolean;
  workHours?: number | null;
  warning?: string | null;
  checkInImageUrl?: string | null;
  locationGps?: string | null;
}

export const timekeepingApi = {
  async getToday(): Promise<TodayTimekeepingResponse> {
    const res = await hrApi.get<
      ApiResponse<TodayTimekeepingResponse> | TodayTimekeepingResponse
    >("hr/timekeeping/today");

    if ("success" in res.data && res.data.success && res.data.data) {
      return res.data.data;
    }

    return res.data as TodayTimekeepingResponse;
  },

  async getHistory(params?: {
    employeeId?: string;
    from?: string;
    to?: string;
    page?: number;
    pageSize?: number;
  }): Promise<TimekeepingHistoryRecord[]> {
    const query = new URLSearchParams();
    if (params?.employeeId) query.append("employeeId", params.employeeId);
    if (params?.from) query.append("from", params.from);
    if (params?.to) query.append("to", params.to);
    if (params?.page) query.append("page", params.page.toString());
    if (params?.pageSize) query.append("pageSize", params.pageSize.toString());

    const url = `hr/timekeeping${query.toString() ? `?${query.toString()}` : ""}`;

    const res = await hrApi.get<
      ApiResponse<TimekeepingHistoryRecord[]> | TimekeepingHistoryRecord[]
    >(url);

    if ("success" in res.data && res.data.success && Array.isArray(res.data.data)) {
      return res.data.data;
    }

    if (Array.isArray(res.data)) {
      return res.data as TimekeepingHistoryRecord[];
    }

    return [];
  },

  async uploadSelfie(file: File): Promise<UploadSelfieResponse> {
    const formData = new FormData();
    formData.append("file", file);

    const res = await hrApi.post<
      ApiResponse<UploadSelfieResponse> | UploadSelfieResponse
    >("hr/timekeeping/upload-selfie", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    if ("success" in res.data && res.data.success && res.data.data) {
      return res.data.data;
    }

    return res.data as UploadSelfieResponse;
  },

  async checkIn(payload: {
    locationGps: string;
    checkInImageUrl?: string;
  }): Promise<void> {
    await hrApi.post("hr/timekeeping/check-in", payload);
  },

  async checkOut(payload: { locationGps: string }): Promise<void> {
    await hrApi.post("hr/timekeeping/check-out", payload);
  },

  /**
   * Get monthly timekeeping summary (Manager+)
   * GET /hr/timekeeping/summary?month=&year=
   * BE có thể trả camelCase hoặc snake_case.
   */
  async getSummary(params?: {
    month?: number;
    year?: number;
  }): Promise<TimekeepingSummary | null> {
    const query = new URLSearchParams();
    if (params?.month) query.append("month", params.month.toString());
    if (params?.year) query.append("year", params.year.toString());

    const url = `hr/timekeeping/summary${query.toString() ? `?${query.toString()}` : ""}`;

    const res = await hrApi.get<ApiResponse<unknown> | Record<string, unknown>>(url);

    let raw: unknown = null;
    if (res.data && typeof res.data === "object" && "success" in res.data && (res.data as ApiResponse<unknown>).success) {
      raw = (res.data as ApiResponse<unknown>).data;
    } else if (res.data && typeof res.data === "object") {
      raw = res.data;
    }

    if (raw == null || typeof raw !== "object") return null;

    const o = raw as Record<string, unknown>;
    return {
      totalEmployees: normaliseNumber(o.totalEmployees ?? o.total_employees),
      totalWorkDays: normaliseNumber(o.totalWorkDays ?? o.total_work_days),
      totalWorkHours: normaliseNumber(o.totalWorkHours ?? o.total_work_hours),
      totalLateCount: normaliseNumber(o.totalLateCount ?? o.total_late_count),
    };
  },

  /**
   * Get list of staff in a store for check-in selection
   * GET /hr/staff?storeId=
   */
  async getStaffInStore(storeId: string): Promise<Staff[]> {
    const res = await hrApi.get<ApiResponse<Staff[]> | Staff[]>(
      `hr/staff?storeId=${storeId}`,
    );

    if ("success" in res.data && res.data.success && Array.isArray(res.data.data)) {
      return res.data.data;
    }

    if (Array.isArray(res.data)) {
      return res.data as Staff[];
    }

    return [];
  },
};

