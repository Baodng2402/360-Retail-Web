export interface InviteUserDto {
  email: string;
  storeId: string;
  role?: string;
}

export interface StaffInviteResponse {
  message?: string;
  invitationId?: string;
}

export interface Staff {
  id: string;
  name?: string;
  email: string;
  role?: string;
  storeRole?: "Owner" | "Manager" | "Staff";
}
