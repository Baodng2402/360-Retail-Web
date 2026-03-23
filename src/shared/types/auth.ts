import { UserStatus, UserStatusType } from "@/shared/types/jwt-claims";

export interface User {
  id: string;
  email: string;
  role: string;
  name: string;
  avatar?: string;
  status?: UserStatusType;
  storeId?: string;
  storeRole?: string;
}

export type UserRole =
  | "PotentialOwner"
  | "StoreOwner"
  | "Manager"
  | "Staff"
  | "Customer"
  | "SuperAdmin";
