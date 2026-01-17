import { identityApi } from "./axios-instances";
import type { InviteUserDto, StaffInviteResponse } from "@/shared/types/staff";
import type { ApiResponse } from "@/shared/types/api-response";

export const staffApi = {
  async inviteStaff(data: InviteUserDto): Promise<StaffInviteResponse> {
    const res = await identityApi.post<ApiResponse<StaffInviteResponse> | StaffInviteResponse>(
      "identity/staff/invite",
      data
    );
    
    if ("success" in res.data && res.data.success && res.data.data) {
      return res.data.data;
    }
    return res.data as StaffInviteResponse;
  },
};
