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
    const queryParams = new URLSearchParams();

    if (params?.status) queryParams.append("status", params.status);
    if (params?.fromDate) queryParams.append("fromDate", params.fromDate);
    if (params?.toDate) queryParams.append("toDate", params.toDate);
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.pageSize) queryParams.append("pageSize", params.pageSize.toString());

    const res = await salesApi.get<ApiResponse<Order[]> | Order[]>(
      `sales/sales/orders?${queryParams.toString()}`
    );

    if ("success" in res.data && res.data.success && Array.isArray(res.data.data)) {
      return res.data.data;
    }
    if (Array.isArray(res.data)) {
      return res.data;
    }
    return [];
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
