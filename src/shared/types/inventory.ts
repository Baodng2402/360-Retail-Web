export type InventoryTicketType = "Import" | "Export";
export type InventoryTicketStatus = "Draft" | "Confirmed" | "Cancelled";

export interface InventoryItem {
    productId: string;
    productName?: string;
    quantity: number;
    productVariantId?: string | null;
    note?: string;
}

export interface InventoryTicket {
    id: string;
    code: string;
    type: InventoryTicketType;
    status: InventoryTicketStatus;
    note?: string;
    items: InventoryItem[];
    createdAt: string;
    confirmedAt?: string | null;
    cancelledAt?: string | null;
}

export interface CreateInventoryTicketDto {
    type: InventoryTicketType;
    note?: string;
    items: {
        productId: string;
        quantity: number;
        productVariantId?: string | null;
        note?: string;
    }[];
}

export interface GetInventoryParams {
    type?: InventoryTicketType;
    status?: InventoryTicketStatus;
    page?: number;
    pageSize?: number;
}
