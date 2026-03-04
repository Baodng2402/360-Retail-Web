import { salesApi } from "./axios-instances";
import type {
    InventoryTicket,
    CreateInventoryTicketDto,
    GetInventoryParams,
} from "@/shared/types/inventory";
import type { ApiResponse } from "@/shared/types/api-response";

export const inventoryApi = {
    /**
     * Create a new inventory ticket (Import or Export)
     * POST /sales/inventory
     */
    async createTicket(data: CreateInventoryTicketDto): Promise<string> {
        const res = await salesApi.post<ApiResponse<string> | string>(
            "sales/inventory",
            data,
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

    /**
     * Get list of inventory tickets with optional filters
     * GET /sales/inventory
     */
    async getTickets(params?: GetInventoryParams): Promise<{
        items: InventoryTicket[];
        totalCount: number;
        pageNumber: number;
        pageSize: number;
        totalPages: number;
    }> {
        const query = new URLSearchParams();
        if (params?.type) query.append("type", params.type);
        if (params?.status) query.append("status", params.status);
        query.append("page", (params?.page ?? 1).toString());
        query.append("pageSize", (params?.pageSize ?? 20).toString());

        const res = await salesApi.get<
            | ApiResponse<{
                items: InventoryTicket[];
                totalCount: number;
                pageNumber: number;
                pageSize: number;
                totalPages: number;
            }>
            | InventoryTicket[]
        >(`sales/inventory?${query.toString()}`);

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
                    items: data as InventoryTicket[],
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

    /**
     * Get inventory ticket detail
     * GET /sales/inventory/{id}
     */
    async getTicketById(id: string): Promise<InventoryTicket> {
        const res = await salesApi.get<ApiResponse<InventoryTicket> | InventoryTicket>(
            `sales/inventory/${id}`,
        );

        if ("success" in res.data && res.data.success && res.data.data) {
            return res.data.data;
        }
        return res.data as InventoryTicket;
    },

    /**
     * Confirm an inventory ticket (updates stock)
     * PUT /sales/inventory/{id}/confirm
     */
    async confirmTicket(id: string): Promise<void> {
        await salesApi.put(`sales/inventory/${id}/confirm`);
    },

    /**
     * Cancel an inventory ticket (Draft only)
     * PUT /sales/inventory/{id}/cancel
     */
    async cancelTicket(id: string): Promise<void> {
        await salesApi.put(`sales/inventory/${id}/cancel`);
    },

    /**
     * Delete an inventory ticket (Draft/Cancelled only)
     * DELETE /sales/inventory/{id}
     */
    async deleteTicket(id: string): Promise<void> {
        await salesApi.delete(`sales/inventory/${id}`);
    },

    /**
     * Check & send low stock warning email
     * POST /sales/notifications/low-stock-check
     */
    async checkLowStock(threshold = 10): Promise<void> {
        await salesApi.post(`sales/notifications/low-stock-check?threshold=${threshold}`);
    },
};
