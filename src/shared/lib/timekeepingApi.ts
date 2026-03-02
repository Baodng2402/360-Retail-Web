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
};

