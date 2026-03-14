import { hrApi } from "./axios-instances";
import type { ApiResponse } from "@/shared/types/api-response";

export interface TodayTimekeepingRecord {
  id: string;
  employeeName: string;
  checkInTime: string;
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
   * GET /hr/timekeeping/summary
   */
  async getSummary(params?: {
    month?: number;
    year?: number;
  }): Promise<unknown> {
    const query = new URLSearchParams();
    if (params?.month) query.append("month", params.month.toString());
    if (params?.year) query.append("year", params.year.toString());

    const url = `hr/timekeeping/summary${query.toString() ? `?${query.toString()}` : ""
      }`;

    const res = await hrApi.get<ApiResponse<unknown> | unknown>(url);

    if (
      res.data &&
      typeof res.data === "object" &&
      "success" in res.data &&
      (res.data as ApiResponse<unknown>).success
    ) {
      return (res.data as ApiResponse<unknown>).data;
    }
    return res.data;
  },
};

