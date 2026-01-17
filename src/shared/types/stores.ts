export interface Store {
  id: string;
  storeName: string;
  address?: string;
  phone?: string;
  email?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
  isDefault?: boolean; // Only present in my-owned-stores and getStoreById responses
}

export interface CreateStoreDto {
  storeName: string;
  address?: string;
  phone?: string;
}

export interface UpdateStoreDto {
  storeName: string;
  address?: string;
  phone?: string;
  isActive: boolean;
}
