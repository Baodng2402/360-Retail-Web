export interface Store {
  id: string;
  storeName: string;
  address?: string;
  phone?: string;
  latitude?: number | null;
  longitude?: number | null;
  email?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
  isDefault?: boolean; // Only present in my-owned-stores and getStoreById responses
}

export interface StoreCreatePaymentInfo {
  paymentId?: string;
  paymentUrl?: string | null;
  amount?: number | null;
  planName?: string | null;
}

export interface StoreCreateResponse {
  store: Store;
  payment?: StoreCreatePaymentInfo | null;
  message?: string | null;
}

export interface CreateStoreDto {
  storeName: string;
  address?: string;
  phone?: string;
  planId?: string;
  latitude?: number | null;
  longitude?: number | null;
}

export interface UpdateStoreDto {
  storeName: string;
  address?: string;
  phone?: string;
  isActive: boolean;
  latitude?: number | null;
  longitude?: number | null;
}
