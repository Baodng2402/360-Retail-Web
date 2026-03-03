import { create } from "zustand";

interface DashboardEventsState {
  lastOrderCreatedAt: string | null;
  lastOrderId: string | null;
  emitOrderCreated: (orderId?: string | null) => void;
}

export const useDashboardEventsStore = create<DashboardEventsState>((set) => ({
  lastOrderCreatedAt: null,
  lastOrderId: null,
  emitOrderCreated: (orderId) =>
    set({
      lastOrderCreatedAt: new Date().toISOString(),
      lastOrderId: orderId ?? null,
    }),
}));

