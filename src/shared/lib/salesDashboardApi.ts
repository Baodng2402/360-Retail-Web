import { salesApi } from "./axios-instances";
import type { ApiResponse } from "@/shared/types/api-response";

export interface SalesOverview {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  totalProducts: number;
  avgOrderValue: number;
  revenueGrowth: number;
  orderGrowth: number;
}

export interface RevenueChartPoint {
  label: string;
  revenue: number;
  orderCount: number;
}

export interface RevenueChartResponse {
  dataPoints: RevenueChartPoint[];
  totalRevenue: number;
  groupBy: string;
}

export interface TopProduct {
  productId: string;
  productName: string;
  quantitySold: number;
  revenue: number;
}

export interface OrderStatusDistributionItem {
  status: string;
  count: number;
  percentage: number;
}

export interface OrderStatusOverview {
  statuses: OrderStatusDistributionItem[];
  totalOrders: number;
}

export interface InventorySummary {
  totalProducts: number;
  inStockCount: number;
  lowStockCount: number;
  outOfStockCount: number;
  lowStockProducts: {
    productId: string;
    productName: string;
    stockQuantity: number;
    sku?: string;
  }[];
}

export interface RecentActivityItem {
  type: string;
  code: string;
  description: string;
  amount: number | null;
  status: string;
  createdAt: string;
}

export interface RecentActivityResponse {
  activities: RecentActivityItem[];
}

interface SalesDashboardRequestOptions {
  /** Khi true và backend trả FeatureNotAvailable (ví dụ Trial không có has_dashboard), interceptor sẽ không bật popup nâng cấp. */
  silentOnFeatureGate?: boolean;
}

export const salesDashboardApi = {
  async getOverview(params?: { from?: string; to?: string }): Promise<SalesOverview> {
    const query = new URLSearchParams();
    if (params?.from) query.append("from", params.from);
    if (params?.to) query.append("to", params.to);
    const url = `sales/dashboard/overview${
      query.toString() ? `?${query.toString()}` : ""
    }`;
    const res = await salesApi.get<ApiResponse<SalesOverview> | SalesOverview>(
      url,
    );
    if ("success" in res.data && res.data.success && res.data.data) {
      return res.data.data;
    }
    return res.data as SalesOverview;
  },

  async getRevenueChart(params?: {
    from?: string;
    to?: string;
    groupBy?: "day" | "week" | "month";
  }): Promise<RevenueChartResponse> {
    const query = new URLSearchParams();
    if (params?.from) query.append("from", params.from);
    if (params?.to) query.append("to", params.to);
    query.append("groupBy", params?.groupBy ?? "month");
    const res = await salesApi.get<
      ApiResponse<RevenueChartResponse> | RevenueChartResponse
    >(`sales/dashboard/revenue-chart?${query.toString()}`);
    if ("success" in res.data && res.data.success && res.data.data) {
      return res.data.data;
    }
    return res.data as RevenueChartResponse;
  },

  async getTopProducts(
    params?: {
      from?: string;
      to?: string;
      top?: number;
    },
    options?: SalesDashboardRequestOptions,
  ): Promise<TopProduct[]> {
    const query = new URLSearchParams();
    if (params?.from) query.append("from", params.from);
    if (params?.to) query.append("to", params.to);
    if (params?.top) query.append("top", String(params.top));
    const url = `sales/dashboard/top-products${
      query.toString() ? `?${query.toString()}` : ""
    }`;
    const config =
      options?.silentOnFeatureGate === true
        ? { headers: { "X-Skip-Feature-Gate": "1" } }
        : undefined;
    const res = await salesApi.get<ApiResponse<TopProduct[]> | TopProduct[]>(
      url,
      config,
    );
    if ("success" in res.data && res.data.success && Array.isArray(res.data.data)) {
      return res.data.data;
    }
    if (Array.isArray(res.data)) {
      return res.data;
    }
    return [];
  },

  async getOrderStatus(params?: {
    from?: string;
    to?: string;
  }): Promise<OrderStatusOverview> {
    const query = new URLSearchParams();
    if (params?.from) query.append("from", params.from);
    if (params?.to) query.append("to", params.to);
    const url = `sales/dashboard/order-status${
      query.toString() ? `?${query.toString()}` : ""
    }`;
    const res = await salesApi.get<
      ApiResponse<OrderStatusOverview> | OrderStatusOverview
    >(url);
    if ("success" in res.data && res.data.success && res.data.data) {
      return res.data.data;
    }
    return res.data as OrderStatusOverview;
  },

  async getInventorySummary(): Promise<InventorySummary> {
    const res = await salesApi.get<
      ApiResponse<InventorySummary> | InventorySummary
    >("sales/dashboard/inventory-summary");
    if ("success" in res.data && res.data.success && res.data.data) {
      return res.data.data;
    }
    return res.data as InventorySummary;
  },

  async getRecentActivity(limit = 20): Promise<RecentActivityResponse> {
    const res = await salesApi.get<
      ApiResponse<RecentActivityResponse> | RecentActivityResponse
    >(`sales/dashboard/recent-activity?limit=${limit}`);
    if ("success" in res.data && res.data.success && res.data.data) {
      return res.data.data;
    }
    return res.data as RecentActivityResponse;
  },
};

