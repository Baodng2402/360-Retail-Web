import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "motion/react";
import { Card } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/shared/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/shared/components/ui/select";
import { Label } from "@/shared/components/ui/label";
import {
    Warehouse,
    Plus,
    CheckCircle2,
    XCircle,
    Trash2,
    Eye,
    Package,
    ArrowDownToLine,
    ArrowUpFromLine,
    Loader2,
    AlertTriangle,
} from "lucide-react";
import { inventoryApi } from "@/shared/lib/inventoryApi";
import { productsApi } from "@/shared/lib/productsApi";
import { storesApi } from "@/shared/lib/storesApi";
import type {
    InventoryTicket,
    InventoryTicketType,
    InventoryTicketStatus,
    CreateInventoryTicketDto,
} from "@/shared/types/inventory";
import type { Product } from "@/shared/types/products";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";

// ── Types ──────────────────────────────────────────────────────────
interface TicketItemForm {
    productId: string;
    productName: string;
    productVariantId: string | null;
    productVariantName: string;
    quantity: number;
    note: string;
}

// ── Component ──────────────────────────────────────────────────────
const InventoryManagementPage = () => {
    const { t, i18n } = useTranslation(["inventory", "common"]);
    const [searchParams, setSearchParams] = useSearchParams();
    // ── State ──────────────────────────────────────────────────────
    const [tickets, setTickets] = useState<InventoryTicket[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterType, setFilterType] = useState<InventoryTicketType | "all">("all");
    const [filterStatus, setFilterStatus] = useState<InventoryTicketStatus | "all">("all");
    const [page, setPage] = useState(1);
    const [, setTotalPages] = useState(1);

    // Detail dialog
    const [detailTicket, setDetailTicket] = useState<InventoryTicket | null>(null);
    const [detailOpen, setDetailOpen] = useState(false);

    // Create dialog
    const [createOpen, setCreateOpen] = useState(false);
    const [createType, setCreateType] = useState<InventoryTicketType>("Import");
    const [createNote, setCreateNote] = useState("");
    const [createItems, setCreateItems] = useState<TicketItemForm[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [productsLoading, setProductsLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Confirm/Cancel dialog
    const [actionTicketId, setActionTicketId] = useState<string | null>(null);
    const [actionType, setActionType] = useState<"confirm" | "cancel" | "delete" | null>(null);
    const [actionLoading, setActionLoading] = useState(false);

    // ── Fetch tickets ──────────────────────────────────────────────
    const fetchTickets = useCallback(async () => {
        setLoading(true);
        try {
            const params: Parameters<typeof inventoryApi.getTickets>[0] = {
                page,
                pageSize: 20,
            };
            if (filterType !== "all") params.type = filterType;
            if (filterStatus !== "all") params.status = filterStatus;

            const result = await inventoryApi.getTickets(params);
            setTickets(result.items);
            setTotalPages(result.totalPages || 1);
        } catch {
            toast.error(t("inventory:page.toast.loadTicketsError"));
            setTickets([]);
        } finally {
            setLoading(false);
        }
    }, [page, filterType, filterStatus]);

    useEffect(() => {
        void fetchTickets();
    }, [fetchTickets]);

    // Mở chi tiết phiếu kho khi vào từ dashboard (recent activity)
    const ticketIdFromUrl = searchParams.get("ticketId");
    useEffect(() => {
        if (!ticketIdFromUrl) return;
        let cancelled = false;
        void (async () => {
            try {
                const ticket = await inventoryApi.getTicketById(ticketIdFromUrl);
                if (cancelled) return;
                setDetailTicket(ticket);
                setDetailOpen(true);
            } catch {
                if (!cancelled) {
                    toast.error(t("inventory:page.toast.ticketNotFound"));
                }
            } finally {
                if (!cancelled) {
                    setSearchParams(
                        (prev) => {
                            const next = new URLSearchParams(prev);
                            next.delete("ticketId");
                            return next;
                        },
                        { replace: true },
                    );
                }
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [ticketIdFromUrl, setSearchParams]);

    // ── Load products for create dialog ────────────────────────────
    const loadProducts = async () => {
        setProductsLoading(true);
        try {
            let storeId: string | undefined;
            try {
                const myStore = await storesApi.getMyStore();
                storeId = myStore.id;
            } catch {
                // If no store, continue without storeId
            }
            const prods = await productsApi.getProducts({
                storeId,
                pageSize: 200,
            });
            setProducts(prods);
        } catch {
            toast.error(t("inventory:page.toast.loadProductsError"));
        } finally {
            setProductsLoading(false);
        }
    };

    // ── Handlers ───────────────────────────────────────────────────
    const handleOpenCreate = () => {
        setCreateType("Import");
        setCreateNote("");
        setCreateItems([]);
        setCreateOpen(true);
        void loadProducts();
    };

    const handleAddItem = () => {
        setCreateItems((prev) => [
            ...prev,
            {
                productId: "",
                productName: "",
                productVariantId: null,
                productVariantName: "",
                quantity: 1,
                note: "",
            },
        ]);
    };

    const handleRemoveItem = (index: number) => {
        setCreateItems((prev) => prev.filter((_, i) => i !== index));
    };

    const handleItemChange = (
        index: number,
        field: keyof TicketItemForm,
        value: string | number | null,
    ) => {
        setCreateItems((prev) =>
            prev.map((item, i) => {
                if (i !== index) return item;
                if (field === "productId") {
                    const product = products.find((p) => p.id === value);
                    return {
                        ...item,
                        productId: value as string,
                        productName: product?.productName ?? "",
                        productVariantId: null,
                        productVariantName: "",
                    };
                }
                if (field === "productVariantId") {
                    const product = products.find((p) => p.id === item.productId);
                    const variant = product?.variants?.find(
                        (v) => v.id === value,
                    );
                    return {
                        ...item,
                        productVariantId: value as string | null,
                        productVariantName:
                            variant
                                ? `${variant.size ?? ""} ${variant.color ?? ""} ${variant.sku ?? ""}`.trim()
                                : "",
                    };
                }
                return { ...item, [field]: value };
            }),
        );
    };

    const handleCreateTicket = async () => {
        if (createItems.length === 0) {
            toast.error(t("inventory:create.toast.needAtLeastOneProduct"));
            return;
        }
        const invalidItems = createItems.filter((item) => {
            if (!item.productId || item.quantity <= 0) return true;
            const product = products.find((p) => p.id === item.productId);
            if (product?.hasVariants && !item.productVariantId) return true;
            return false;
        });
        if (invalidItems.length > 0) {
            toast.error(t("inventory:create.toast.invalidItems"));
            return;
        }

        setSubmitting(true);
        try {
            const payload: CreateInventoryTicketDto = {
                type: createType,
                note: createNote || undefined,
                items: createItems.map((item) => ({
                    productId: item.productId,
                    productVariantId: item.productVariantId || null,
                    quantity: item.quantity,
                    note: item.note || undefined,
                })),
            };
            await inventoryApi.createTicket(payload);
            toast.success(
                createType === "Import"
                    ? t("inventory:create.toast.importSuccess")
                    : t("inventory:create.toast.exportSuccess"),
            );
            setCreateOpen(false);
            void fetchTickets();
        } catch (err: unknown) {
            const message =
                (err as { response?: { data?: { message?: string } } })?.response?.data
                    ?.message || t("inventory:create.toast.createFailed");
            toast.error(message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleViewDetail = async (ticketId: string) => {
        try {
            const ticket = await inventoryApi.getTicketById(ticketId);
            setDetailTicket(ticket);
            setDetailOpen(true);
        } catch {
            toast.error(t("inventory:page.toast.loadTicketDetailError"));
        }
    };

    const handleAction = async () => {
        if (!actionTicketId || !actionType) return;
        setActionLoading(true);
        try {
            if (actionType === "confirm") {
                await inventoryApi.confirmTicket(actionTicketId);
                toast.success(t("inventory:actions.toast.confirmSuccess"));
            } else if (actionType === "cancel") {
                await inventoryApi.cancelTicket(actionTicketId);
                toast.success(t("inventory:actions.toast.cancelSuccess"));
            } else if (actionType === "delete") {
                await inventoryApi.deleteTicket(actionTicketId);
                toast.success(t("inventory:actions.toast.deleteSuccess"));
            }
            setActionTicketId(null);
            setActionType(null);
            void fetchTickets();
        } catch (err: unknown) {
            const message =
                (err as { response?: { data?: { message?: string } } })?.response?.data
                    ?.message || t("inventory:actions.toast.actionFailed");
            toast.error(message);
        } finally {
            setActionLoading(false);
        }
    };

    // ── Helpers ────────────────────────────────────────────────────
    const statusBadge = (status: InventoryTicketStatus) => {
        switch (status) {
            case "Draft":
                return (
                    <Badge variant="outline" className="text-amber-600 border-amber-300 bg-amber-50 dark:bg-amber-950/30">
                        {t("inventory:status.draft")}
                    </Badge>
                );
            case "Confirmed":
                return (
                    <Badge className="bg-emerald-500 text-white">
                        {t("inventory:status.confirmed")}
                    </Badge>
                );
            case "Cancelled":
                return (
                    <Badge variant="destructive">
                        {t("inventory:status.cancelled")}
                    </Badge>
                );
        }
    };

    const typeBadge = (type: InventoryTicketType) =>
        type === "Import" ? (
            <Badge className="bg-blue-500 text-white gap-1">
                <ArrowDownToLine className="h-3 w-3" />
                {t("inventory:type.import")}
            </Badge>
        ) : (
            <Badge className="bg-orange-500 text-white gap-1">
                <ArrowUpFromLine className="h-3 w-3" />
                {t("inventory:type.export")}
            </Badge>
        );

    // ── Render ─────────────────────────────────────────────────────
    return (
        <motion.div
            className="container mx-auto py-6 px-4 space-y-5"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as const }}
        >
            {/* Header */}
            <motion.div
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
            >
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[#FF7B21] to-[#19D6C8] flex items-center justify-center text-white shadow-lg shadow-[#FF7B21]/20">
                        <Warehouse className="h-5 w-5" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-foreground">
                            {t("inventory:page.title")}
                        </h1>
                        <p className="text-xs text-muted-foreground">
                            {t("inventory:page.subtitle")}
                        </p>
                    </div>
                </div>
                <Button
                    onClick={handleOpenCreate}
                    className="bg-gradient-to-r from-[#FF7B21] to-[#19D6C8] hover:from-[#FF8B31] hover:to-[#29E6D8] text-white gap-2 shadow-lg shadow-[#FF7B21]/20 hover:shadow-xl hover:shadow-[#FF7B21]/30 transition-all duration-300 hover:-translate-y-0.5"
                >
                    <Plus className="h-4 w-4" />
                    {t("inventory:page.actions.createTicket")}
                </Button>
            </motion.div>

            {/* Filters */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
            >
                <Card className="p-4 backdrop-blur-sm shadow-sm hover:shadow-md transition-shadow duration-300">
                    <div className="flex flex-wrap gap-3 items-center">
                        <div className="flex items-center gap-2">
                            <Label className="text-sm text-muted-foreground whitespace-nowrap">{t("inventory:labels.type")}:</Label>
                            <Select
                                value={filterType}
                                onValueChange={(v) => {
                                    setFilterType(v as InventoryTicketType | "all");
                                    setPage(1);
                                }}
                            >
                                <SelectTrigger className="w-[140px] h-9 bg-background/80 backdrop-blur-sm">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">{t("inventory:filters.all")}</SelectItem>
                                    <SelectItem value="Import">{t("inventory:type.import")}</SelectItem>
                                    <SelectItem value="Export">{t("inventory:type.export")}</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex items-center gap-2">
                            <Label className="text-sm text-muted-foreground whitespace-nowrap">
                                {t("inventory:labels.status")}:
                            </Label>
                            <Select
                                value={filterStatus}
                                onValueChange={(v) => {
                                    setFilterStatus(v as InventoryTicketStatus | "all");
                                    setPage(1);
                                }}
                            >
                                <SelectTrigger className="w-[150px] h-9 bg-background/80 backdrop-blur-sm">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">{t("inventory:filters.all")}</SelectItem>
                                    <SelectItem value="Draft">{t("inventory:status.draft")}</SelectItem>
                                    <SelectItem value="Confirmed">{t("inventory:status.confirmed")}</SelectItem>
                                    <SelectItem value="Cancelled">{t("inventory:status.cancelled")}</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </Card>
            </motion.div>

            {/* Table */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
            >
                <Card className="overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
                {loading ? (
                    <div className="flex items-center justify-center py-16">
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                        <span className="ml-2 text-sm text-muted-foreground">{t("common:states.loading")}</span>
                    </div>
                ) : tickets.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                        <Package className="h-12 w-12 mb-3 opacity-40" />
                        <p className="text-sm">{t("inventory:page.states.empty")}</p>
                        <Button variant="link" className="mt-2 text-teal-600" onClick={handleOpenCreate}>
                            {t("inventory:page.states.createFirst")}
                        </Button>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b bg-gradient-to-r from-[#FF7B21]/5 to-[#19D6C8]/5">
                                    <th className="text-left px-4 py-3 font-semibold text-muted-foreground">{t("inventory:table.code")}</th>
                                    <th className="text-left px-4 py-3 font-semibold text-muted-foreground">{t("inventory:table.type")}</th>
                                    <th className="text-left px-4 py-3 font-semibold text-muted-foreground">{t("inventory:table.status")}</th>
                                    <th className="text-left px-4 py-3 font-semibold text-muted-foreground">{t("inventory:table.note")}</th>
                                    <th className="text-left px-4 py-3 font-semibold text-muted-foreground">{t("inventory:table.createdAt")}</th>
                                    <th className="text-right px-4 py-3 font-semibold text-muted-foreground">{t("inventory:table.actions")}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {tickets.map((ticket, index) => (
                                    <motion.tr
                                        key={ticket.id}
                                        className="border-b last:border-0 hover:bg-gradient-to-r hover:from-[#FF7B21]/5 hover:to-transparent transition-all duration-200"
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ duration: 0.3, delay: index * 0.03 }}
                                    >
                                        <td className="px-4 py-3 font-mono text-xs font-medium">
                                            {ticket.code}
                                        </td>
                                        <td className="px-4 py-3">{typeBadge(ticket.type)}</td>
                                        <td className="px-4 py-3">{statusBadge(ticket.status)}</td>
                                        <td className="px-4 py-3 text-muted-foreground text-xs max-w-[200px] truncate">
                                            {ticket.note || "—"}
                                        </td>
                                        <td className="px-4 py-3 text-xs text-muted-foreground">
                                            {new Date(ticket.createdAt).toLocaleString(i18n.language)}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center justify-end gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8"
                                                    title={t("inventory:page.actions.viewDetail")}
                                                    onClick={() => void handleViewDetail(ticket.id)}
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                                {ticket.status === "Draft" && (
                                                    <>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 transition-all duration-200"
                                                            title={t("inventory:page.actions.confirmTicket")}
                                                            onClick={() => {
                                                                setActionTicketId(ticket.id);
                                                                setActionType("confirm");
                                                            }}
                                                        >
                                                            <CheckCircle2 className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-amber-600 hover:text-amber-700 hover:bg-amber-50 transition-all duration-200"
                                                            title={t("inventory:page.actions.cancelTicket")}
                                                            onClick={() => {
                                                                setActionTicketId(ticket.id);
                                                                setActionType("cancel");
                                                            }}
                                                        >
                                                            <XCircle className="h-4 w-4" />
                                                        </Button>
                                                    </>
                                                )}
                                                {(ticket.status === "Draft" ||
                                                    ticket.status === "Cancelled") && (
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50 transition-all duration-200"
                                                            title={t("inventory:page.actions.deleteTicket")}
                                                            onClick={() => {
                                                                setActionTicketId(ticket.id);
                                                                setActionType("delete");
                                                            }}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    )}
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </Card>
            </motion.div>

            {/* ── Create Ticket Dialog ────────────────────────────────── */}
            <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Warehouse className="h-5 w-5 text-teal-500" />
                            {t("inventory:create.title")}
                        </DialogTitle>
                        <DialogDescription>
                            {t("inventory:create.description")}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 mt-2">
                        {/* Type */}
                        <div className="flex items-center gap-3">
                            <Label className="w-20">{t("inventory:labels.type")}:</Label>
                            <Select
                                value={createType}
                                onValueChange={(v) => setCreateType(v as InventoryTicketType)}
                            >
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Import">{t("inventory:type.import")}</SelectItem>
                                    <SelectItem value="Export">{t("inventory:type.export")}</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Note */}
                        <div className="flex items-start gap-3">
                            <Label className="w-20 mt-2">{t("inventory:labels.note")}:</Label>
                            <textarea
                                className="flex-1 min-h-[60px] rounded-md border border-input bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                                placeholder={t("inventory:create.placeholders.note")}
                                value={createNote}
                                onChange={(e) => setCreateNote(e.target.value)}
                            />
                        </div>

                        {/* Items */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label className="font-medium">{t("inventory:create.fields.items")}</Label>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={handleAddItem}
                                    className="gap-1"
                                >
                                    <Plus className="h-3 w-3" />
                                    {t("common:actions.create")}
                                </Button>
                            </div>

                            {productsLoading ? (
                                <div className="flex items-center gap-2 py-4 justify-center text-muted-foreground">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    <span className="text-sm">{t("inventory:create.states.loadingProducts")}</span>
                                </div>
                            ) : createItems.length === 0 ? (
                                <div className="py-8 text-center text-sm text-muted-foreground border rounded-md bg-muted/20">
                                    {t("inventory:create.states.emptyItems")}
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {createItems.map((item, index) => {
                                        const selectedProduct = products.find(
                                            (p) => p.id === item.productId,
                                        );
                                        const hasVariants =
                                            selectedProduct?.hasVariants &&
                                            (selectedProduct.variants?.length ?? 0) > 0;

                                        return (
                                            <div
                                                key={index}
                                                className="flex flex-col gap-2 p-3 border rounded-md bg-muted/10"
                                            >
                                                {/* Product Select */}
                                                <div className="flex items-center gap-2">
                                                    <Select
                                                        value={item.productId || ""}
                                                        onValueChange={(v) =>
                                                            handleItemChange(
                                                                index,
                                                                "productId",
                                                                v,
                                                            )
                                                        }
                                                    >
                                                        <SelectTrigger className="flex-1 h-9">
                                                            <SelectValue placeholder={t("inventory:create.placeholders.selectProduct")} />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {products.map((p) => (
                                                                <SelectItem
                                                                    key={p.id}
                                                                    value={p.id}
                                                                >
                                                                    {p.productName}
                                                                    {p.hasVariants && " ★"}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    <input
                                                        type="number"
                                                        min={1}
                                                        className="w-20 h-9 rounded-md border border-input bg-background px-2 text-sm text-center focus:outline-none focus:ring-2 focus:ring-ring"
                                                        placeholder={t("inventory:create.placeholders.quantity")}
                                                        value={item.quantity}
                                                        onChange={(e) =>
                                                            handleItemChange(
                                                                index,
                                                                "quantity",
                                                                parseInt(
                                                                    e.target.value,
                                                                ) || 0,
                                                            )
                                                        }
                                                    />
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-red-500 shrink-0"
                                                        onClick={() =>
                                                            handleRemoveItem(index)
                                                        }
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>

                                                {/* Variant Select - Chỉ hiện khi sản phẩm có biến thể */}
                                                {hasVariants && (
                                                    <div className="flex items-center gap-2 pl-2">
                                                        <Label className="text-xs text-muted-foreground w-20">
                                                            {t("inventory:create.fields.variant")}:
                                                        </Label>
                                                        <Select
                                                            value={
                                                                item.productVariantId ||
                                                                ""
                                                            }
                                                            onValueChange={(v) =>
                                                                handleItemChange(
                                                                    index,
                                                                    "productVariantId",
                                                                    v ||
                                                                        null,
                                                                )
                                                            }
                                                        >
                                                            <SelectTrigger className="flex-1 h-8 text-sm">
                                                                <SelectValue placeholder={t("inventory:create.placeholders.selectVariant")} />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {selectedProduct?.variants?.map(
                                                                    (variant) => (
                                                                        <SelectItem
                                                                            key={
                                                                                variant.id
                                                                            }
                                                                            value={
                                                                                variant.id!
                                                                            }
                                                                        >
                                                                            {[
                                                                                variant.size,
                                                                                variant.color,
                                                                                variant.sku,
                                                                            ]
                                                                                .filter(
                                                                                    Boolean,
                                                                                )
                                                                                .join(
                                                                                    " • ",
                                                                                )}{" "}
                                                                            ({t("inventory:create.variantStock", { stock: variant.stockQuantity ?? 0 })})
                                                                        </SelectItem>
                                                                    ),
                                                                )}
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                )}

                                                {/* Note */}
                                                <div className="flex items-center gap-2 pl-2">
                                                    <Label className="text-xs text-muted-foreground w-20">
                                                        {t("inventory:create.fields.itemNote")}:
                                                    </Label>
                                                    <input
                                                        type="text"
                                                        className="flex-1 h-8 rounded-md border border-input bg-background px-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                                                        placeholder={t("inventory:create.placeholders.itemNote")}
                                                        value={item.note}
                                                        onChange={(e) =>
                                                            handleItemChange(
                                                                index,
                                                                "note",
                                                                e.target.value,
                                                            )
                                                        }
                                                    />
                                                </div>

                                                {/* Warning nếu sản phẩm có biến thể nhưng chưa chọn */}
                                                {hasVariants &&
                                                    !item.productVariantId && (
                                                        <p className="text-xs text-amber-600 pl-2">
                                                            {t("inventory:create.states.variantRequired")}
                                                        </p>
                                                    )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>

                    <DialogFooter className="mt-4">
                        <Button
                            variant="outline"
                            onClick={() => setCreateOpen(false)}
                            disabled={submitting}
                        >
                            {t("common:actions.cancel")}
                        </Button>
                        <Button
                            onClick={() => void handleCreateTicket()}
                            disabled={submitting || createItems.length === 0}
                            className="bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-600 hover:to-blue-600 text-white gap-2"
                        >
                            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                            {createType === "Import"
                              ? t("inventory:create.actions.createImport")
                              : t("inventory:create.actions.createExport")}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* ── Detail Dialog ───────────────────────────────────────── */}
            <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Eye className="h-5 w-5 text-teal-500" />
                            {t("inventory:detail.title")}
                        </DialogTitle>
                    </DialogHeader>
                    {detailTicket && (
                        <div className="space-y-4 mt-2">
                            <div className="grid grid-cols-2 gap-3 text-sm">
                                <div>
                                    <span className="text-muted-foreground">{t("inventory:labels.code")}:</span>
                                    <p className="font-mono font-medium">{detailTicket.code}</p>
                                </div>
                                <div>
                                    <span className="text-muted-foreground">{t("inventory:labels.type")}:</span>
                                    <div className="mt-1">{typeBadge(detailTicket.type)}</div>
                                </div>
                                <div>
                                    <span className="text-muted-foreground">{t("inventory:labels.status")}:</span>
                                    <div className="mt-1">{statusBadge(detailTicket.status)}</div>
                                </div>
                                <div>
                                    <span className="text-muted-foreground">{t("inventory:labels.createdAt")}:</span>
                                    <p>{new Date(detailTicket.createdAt).toLocaleString(i18n.language)}</p>
                                </div>
                            </div>
                            {detailTicket.note && (
                                <div className="text-sm">
                                    <span className="text-muted-foreground">{t("inventory:labels.note")}:</span>
                                    <p className="mt-1">{detailTicket.note}</p>
                                </div>
                            )}

                            {/* Items */}
                            <div>
                                <Label className="text-sm font-medium">
                                    {t("inventory:detail.itemsTitle", { count: detailTicket.items?.length ?? 0 })}
                                </Label>
                                <div className="mt-2 space-y-1.5">
                                    {(detailTicket.items ?? []).map((item, i) => (
                                        <div
                                            key={i}
                                            className="flex items-center justify-between p-2 rounded-md border bg-muted/10 text-sm"
                                        >
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-2">
                                                    <Package className="h-4 w-4 text-muted-foreground" />
                                                    <span>{item.productName || item.productId}</span>
                                                </div>
                                                {item.productVariantId && (
                                                    <span className="text-xs text-muted-foreground pl-6">
                                                        {t("inventory:detail.variantLabel")}: {item.productVariantId}
                                                    </span>
                                                )}
                                            </div>
                                            <Badge variant="outline">x{item.quantity}</Badge>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* ── Confirm/Cancel/Delete Action Dialog ─────────────────── */}
            <Dialog
                open={!!actionTicketId && !!actionType}
                onOpenChange={() => {
                    setActionTicketId(null);
                    setActionType(null);
                }}
            >
                <DialogContent className="sm:max-w-sm">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-amber-500" />
                            {actionType === "confirm" && t("inventory:actions.dialog.titleConfirm")}
                            {actionType === "cancel" && t("inventory:actions.dialog.titleCancel")}
                            {actionType === "delete" && t("inventory:actions.dialog.titleDelete")}
                        </DialogTitle>
                        <DialogDescription>
                            {actionType === "confirm" && t("inventory:actions.dialog.descriptionConfirm")}
                            {actionType === "cancel" && t("inventory:actions.dialog.descriptionCancel")}
                            {actionType === "delete" && t("inventory:actions.dialog.descriptionDelete")}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="mt-4">
                        <Button
                            variant="outline"
                            onClick={() => {
                                setActionTicketId(null);
                                setActionType(null);
                            }}
                            disabled={actionLoading}
                        >
                            {t("common:actions.cancel")}
                        </Button>
                        <Button
                            variant={actionType === "delete" ? "destructive" : "default"}
                            className={
                                actionType === "confirm"
                                    ? "bg-emerald-500 hover:bg-emerald-600 text-white"
                                    : ""
                            }
                            onClick={() => void handleAction()}
                            disabled={actionLoading}
                        >
                            {actionLoading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                            {actionType === "confirm" && t("common:actions.confirm")}
                            {actionType === "cancel" && t("inventory:actions.dialog.confirmCancel")}
                            {actionType === "delete" && t("common:actions.delete")}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </motion.div>
    );
};

export default InventoryManagementPage;
