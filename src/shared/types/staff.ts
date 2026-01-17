export interface InviteUserDto {
  email: string;
  storeId: string;
  role?: string;
}

export interface StaffInviteResponse {
  message?: string;
  invitationId?: string;
}
