export interface Customer {
  id: string;
  fullName: string;
  phoneNumber: string;
  email?: string | null;
  createdAt?: string;
  isActive?: boolean;
  totalOrders?: number;
  totalSpend?: number;
}

export interface CreateCustomerDto {
  fullName: string;
  phoneNumber: string;
  email?: string;
}

export interface UpdateCustomerDto {
  fullName: string;
  phoneNumber: string;
  email?: string;
  isActive?: boolean;
}

