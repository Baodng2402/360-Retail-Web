export interface Employee {
  id: string;
  appUserId: string;
  storeId: string;
  fullName: string;
  position: string;
  userName: string;
  email: string;
  phoneNumber?: string | null;
  baseSalary?: number;
  joinDate?: string;
  isActive: boolean;
  avatarUrl?: string | null;
}

export interface UpdateEmployeeProfileDto {
  fullName?: string;
  userName?: string;
  phoneNumber?: string;
}

export interface UpdateEmployeeByOwnerDto {
  fullName?: string;
  position?: string;
  baseSalary?: number;
  isActive?: boolean;
}
