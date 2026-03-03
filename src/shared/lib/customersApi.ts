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
  async getCustomers(
    params?: GetCustomersParams,
  ): Promise<PagedResult<Customer>> {
    const query = new URLSearchParams();
    if (params?.page) query.append("page", params.page.toString());
    if (params?.pageSize) query.append("pageSize", params.pageSize.toString());
    if (params?.keyword) query.append("keyword", params.keyword);

    const url = `crm/customers${
      query.toString() ? `?${query.toString()}` : ""
    }`;

    const res = await crmApi.get<
      ApiResponse<{ items: Customer[]; total: number; page: number; pageSize: number }> |
        Customer[]
    >(url);

    if ("success" in res.data && res.data.success && res.data.data) {
      const data = res.data.data;
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

    if (Array.isArray(res.data)) {
      const items = res.data as Customer[];
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
    const res = await crmApi.post<ApiResponse<Customer> | Customer>(
      "crm/customers",
      payload,
    );
    if ("success" in res.data && res.data.success && res.data.data) {
      return res.data.data;
    }
    return res.data as Customer;
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

    if ("success" in res.data) {
      return res.data.data ?? null;
    }
    return (res.data as LoyaltySummary) ?? null;
  },

  async getLoyaltyTransactions(
    customerId: string,
  ): Promise<LoyaltyTransaction[]> {
    const res = await crmApi.get<
      ApiResponse<{ items: LoyaltyTransaction[] } | LoyaltyTransaction[]> |
        LoyaltyTransaction[]
    >(`crm/customers/${customerId}/loyalty-transactions`);

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

