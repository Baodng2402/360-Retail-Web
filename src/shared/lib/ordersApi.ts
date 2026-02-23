import { salesApi } from "./axios-instances";
import type {
  Order,
  CreateOrderDto,
  GetOrdersParams,
} from "@/shared/types/orders";
import type { ApiResponse } from "@/shared/types/api-response";

export const ordersApi = {
  async createOrder(data: CreateOrderDto): Promise<string> {
    const res = await salesApi.post<ApiResponse<string> | { token?: string } | string>(
      "sales/sales/orders",
      data
    );
    
    if (typeof res.data === "object" && res.data !== null && "success" in res.data) {
      const apiRes = res.data as ApiResponse<string>;
      if (apiRes.success && typeof apiRes.data === "string") {
        return apiRes.data;
      }
    }
    if (typeof res.data === "string") {
      return res.data;
    }
    throw new Error("Invalid response format");
  },

  async getOrders(params?: GetOrdersParams): Promise<Order[]> {
    const paged = await this.getOrdersPaged(params);
    return paged.items;
  },

  async getOrdersPaged(params?: GetOrdersParams): Promise<{
    items: Order[];
    totalCount: number;
    pageNumber: number;
    pageSize: number;
    totalPages: number;
  }> {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append("status", params.status);
    if (params?.fromDate) queryParams.append("fromDate", params.fromDate);
    if (params?.toDate) queryParams.append("toDate", params.toDate);
    queryParams.append("page", (params?.page ?? 1).toString());
    queryParams.append("pageSize", (params?.pageSize ?? 20).toString());

    const res = await salesApi.get<
      ApiResponse<{ items: Order[]; totalCount: number; pageNumber: number; pageSize: number; totalPages: number }> | Order[]
    >(`sales/sales/orders?${queryParams.toString()}`);

    if ("success" in res.data && res.data.success && res.data.data) {
      const data = res.data.data;
      if (typeof data === "object" && "items" in data && Array.isArray(data.items)) {
        return {
          items: data.items,
          totalCount: data.totalCount ?? data.items.length,
          pageNumber: data.pageNumber ?? 1,
          pageSize: data.pageSize ?? 20,
          totalPages: data.totalPages ?? 1,
        };
      }
      if (Array.isArray(data)) {
        return {
          items: data,
          totalCount: data.length,
          pageNumber: 1,
          pageSize: data.length,
          totalPages: 1,
        };
      }
    }
    if (Array.isArray(res.data)) {
      return {
        items: res.data,
        totalCount: res.data.length,
        pageNumber: 1,
        pageSize: res.data.length,
        totalPages: 1,
      };
    }
    return { items: [], totalCount: 0, pageNumber: 1, pageSize: 20, totalPages: 0 };
  },

  async getOrderById(id: string): Promise<Order> {
    const res = await salesApi.get<ApiResponse<Order> | Order>(`sales/sales/orders/${id}`);
    
    if ("success" in res.data && res.data.success && res.data.data) {
      return res.data.data;
    }
    return res.data as Order;
  },

  async updateOrderStatus(id: string, status: string): Promise<Order> {
    const res = await salesApi.put<ApiResponse<Order> | Order>(
      `sales/sales/orders/${id}/status?status=${encodeURIComponent(status)}`
    );
    
    if ("success" in res.data && res.data.success && res.data.data) {
      return res.data.data;
    }
    return res.data as Order;
  },
};
