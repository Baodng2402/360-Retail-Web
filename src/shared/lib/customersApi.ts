import { crmApi } from "./axios-instances";
import type { ApiResponse } from "@/shared/types/api-response";
import type {
  Customer,
  CreateCustomerDto,
  UpdateCustomerDto,
} from "@/shared/types/customers";
import type {
  LoyaltySummary,
  LoyaltyTransaction,
} from "@/shared/types/loyalty";
import type { Feedback } from "@/shared/lib/feedbackApi";

export interface GetCustomersParams {
  page?: number;
  pageSize?: number;
  keyword?: string;
}

export interface PagedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

export const customersApi = {
  /**
   * GET crm/customers – backend lấy storeId từ JWT (claim store_id), không từ query.
   * Token phải có store_id hợp lệ (Guid); thiếu/sai format → 500. Gửi Authorization: Bearer.
   */
  async getCustomers(
    params?: GetCustomersParams,
  ): Promise<PagedResult<Customer>> {
    const query = new URLSearchParams();
    if (params?.page) query.append("page", params.page.toString());
    if (params?.pageSize) query.append("pageSize", params.pageSize.toString());
    if (params?.keyword) query.append("keyword", params.keyword);

    const url = `crm/customers${query.toString() ? `?${query.toString()}` : ""
      }`;

    const res = await crmApi.get<
      | ApiResponse<{
        items: Customer[];
        total: number;
        page: number;
        pageSize: number;
      }>
      | ApiResponse<Customer[]>
      | { data: Customer[]; meta?: { total?: number; page?: number; pageSize?: number } }
      | Customer[]
    >(url);

    const raw = res.data as
      | ApiResponse<{ items: Customer[]; total: number; page: number; pageSize: number }>
      | ApiResponse<Customer[]>
      | { data?: unknown; meta?: { total?: number; page?: number; pageSize?: number } }
      | Customer[];

    // Case 1: chuẩn ApiResponse { success, data }
    if ("success" in raw && raw.success && raw.data) {
      const data = raw.data;
      if (Array.isArray((data as { items?: Customer[] }).items)) {
        const typed = data as {
          items: Customer[];
          total: number;
          page: number;
          pageSize: number;
        };
        return {
          items: typed.items,
          total: typed.total,
          page: typed.page,
          pageSize: typed.pageSize,
        };
      }
      if (Array.isArray(data)) {
        const items = data as Customer[];
        return { items, total: items.length, page: 1, pageSize: items.length };
      }
    }

    // Case 2: backend trả { data: [...], meta: { ... } } (không có success)
    if (!("success" in raw) && "data" in raw && Array.isArray(raw.data)) {
      const items = raw.data as Customer[];
      const meta = raw.meta ?? {};
      return {
        items,
        total: meta.total ?? items.length,
        page: meta.page ?? 1,
        pageSize: meta.pageSize ?? items.length,
      };
    }

    // Case 3: backend trả thẳng mảng Customer[]
    if (Array.isArray(raw)) {
      const items = raw as Customer[];
      return { items, total: items.length, page: 1, pageSize: items.length };
    }

    return { items: [], total: 0, page: 1, pageSize: 20 };
  },

  async getCustomerById(id: string): Promise<Customer> {
    const res = await crmApi.get<ApiResponse<Customer> | Customer>(
      `crm/customers/${id}`,
    );
    if ("success" in res.data && res.data.success && res.data.data) {
      return res.data.data;
    }
    return res.data as Customer;
  },

  async createCustomer(payload: CreateCustomerDto): Promise<Customer> {
    const res = await crmApi.post<
      ApiResponse<Customer> | { data: Customer } | Customer
    >("crm/customers", payload);

    const raw = res.data as ApiResponse<Customer> | { data?: Customer } | Customer;

    // Case 1: chuẩn ApiResponse { success, data }
    if ("success" in raw && raw.success && raw.data) {
      return raw.data;
    }

    // Case 2: backend trả { data: customer }
    if (!("success" in raw) && "data" in raw && raw.data) {
      return raw.data as Customer;
    }

    // Case 3: backend trả thẳng Customer
    return raw as Customer;
  },

  async updateCustomer(
    id: string,
    payload: UpdateCustomerDto,
  ): Promise<Customer> {
    const res = await crmApi.put<ApiResponse<Customer> | Customer>(
      `crm/customers/${id}`,
      payload,
    );
    if ("success" in res.data && res.data.success && res.data.data) {
      return res.data.data;
    }
    return res.data as Customer;
  },

  async deleteCustomer(id: string): Promise<void> {
    await crmApi.delete(`crm/customers/${id}`);
  },

  async getLoyaltySummary(customerId: string): Promise<LoyaltySummary | null> {
    const res = await crmApi.get<
      ApiResponse<LoyaltySummary | null> | LoyaltySummary | null
    >(`crm/customers/${customerId}/loyalty-summary`);

    if (res.data && "success" in res.data) {
      return res.data.data ?? null;
    }
    return (res.data as LoyaltySummary | null) ?? null;
  },

  async getLoyaltyTransactions(
    customerId: string,
    params?: { page?: number; pageSize?: number },
  ): Promise<LoyaltyTransaction[]> {
    const query = new URLSearchParams();
    if (params?.page) query.append("page", params.page.toString());
    if (params?.pageSize) query.append("pageSize", params.pageSize.toString());

    const url = `crm/customers/${customerId}/loyalty-transactions${query.toString() ? `?${query.toString()}` : ""
      }`;

    const res = await crmApi.get<
      ApiResponse<{ items: LoyaltyTransaction[] } | LoyaltyTransaction[]> |
      LoyaltyTransaction[]
    >(url);

    if ("success" in res.data && res.data.success && res.data.data) {
      const data = res.data.data;
      if (Array.isArray(data)) {
        return data;
      }
      if (Array.isArray((data as { items?: LoyaltyTransaction[] }).items)) {
        return (data as { items: LoyaltyTransaction[] }).items;
      }
    }

    if (Array.isArray(res.data)) {
      return res.data as LoyaltyTransaction[];
    }

    return [];
  },

  /**
   * Redeem loyalty points for a customer
   * POST /crm/customers/{customerId}/redeem
   */
  async redeemPoints(
    customerId: string,
    payload: { points: number; description?: string },
  ): Promise<void> {
    await crmApi.post(`crm/customers/${customerId}/redeem`, {
      customerId,
      ...payload,
    });
  },

  async getFeedbackByCustomer(customerId: string): Promise<Feedback[]> {
    const res = await crmApi.get<
      ApiResponse<Feedback[] | { items: Feedback[]; total: number }> |
      Feedback[]
    >(`crm/customers/${customerId}/feedback`);

    if ("success" in res.data && res.data.success && res.data.data) {
      const data = res.data.data;
      if (Array.isArray(data)) {
        return data;
      }
      if (Array.isArray((data as { items?: Feedback[] }).items)) {
        return (data as { items: Feedback[] }).items;
      }
    }

    if (Array.isArray(res.data)) {
      return res.data as Feedback[];
    }

    return [];
  },
};

