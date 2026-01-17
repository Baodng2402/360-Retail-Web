export interface Order {
  id: string;
  code?: string; // Order code like "ORD-260114-1234"
  storeId?: string;
  employeeId?: string;
  customerId?: string | null;
  customerName?: string;
  totalAmount: number;
  discountAmount: number;
  status: OrderStatus;
  paymentMethod?: string;
  paymentStatus?: string; // "Paid", "Unpaid", etc.
  createdAt: string;
  updatedAt?: string;
  orderItems: OrderItem[];
}

export interface OrderItem {
  id: string;
  productId: string;
  productName?: string;
  barCode?: string;
  productVariantId?: string | null;
  sku?: string;
  size?: string;
  color?: string;
  quantity: number;
  unitPrice: number;
  total: number; // total price for this item
}

export type OrderStatus =
  | "Pending"
  | "Processing"
  | "Completed"
  | "Cancelled"
  | "Refunded";

export interface CreateOrderDto {
  customerId?: string;
  paymentMethod?: string;
  discountAmount: number;
  items: CreateOrderItemDto[];
}

export interface CreateOrderItemDto {
  productId: string;
  quantity: number;
  productVariantId?: string;
}

export interface GetOrdersParams {
  status?: OrderStatus;
  fromDate?: string; // ISO date-time string
  toDate?: string; // ISO date-time string
  page?: number;
  pageSize?: number;
}

export interface OrdersResponse {
  items: Order[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
