import { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import { Card } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/components/ui/table";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { superAdminSaasApi } from "@/shared/lib/superAdminSaasApi";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { JsonViewerDialog } from "@/shared/components/JsonViewerDialog";
import { Store, Search, Eye } from "lucide-react";

export default function AdminStoresPage() {
  const { t, i18n } = useTranslation("admin");
  const [items, setItems] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(false);
  const [includeInactive, setIncludeInactive] = useState(true);
  const [q, setQ] = useState("");
  const navigate = useNavigate();
  const [rawOpen, setRawOpen] = useState(false);
  const [rawTitle, setRawTitle] = useState(() => t("stores.rawDialogDefaultTitle"));
  const [rawValue, setRawValue] = useState<unknown>(null);

  const load = async () => {
    try {
      setLoading(true);
      const res = await superAdminSaasApi.listDashboardStores();
      setItems(res);
    } catch (err) {
      console.error("Failed to load stores:", err);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return items;
    return items.filter((s) => {
      const name = String(s.storeName ?? s.name ?? "").toLowerCase();
      const address = String(s.address ?? "").toLowerCase();
      const id = String(s.id ?? "").toLowerCase();
      return name.includes(term) || address.includes(term) || id.includes(term);
    });
  }, [items, q]);

  const locale = i18n.language.toLowerCase().startsWith("en") ? "en-US" : "vi-VN";

  const formatDate = (value?: string) => {
    if (!value) return "—";
    try {
      return new Date(value).toLocaleDateString(locale);
    } catch {
      return value;
    }
  };

  const isActiveStore = (s: Record<string, unknown>) => {
    const v = s.isActive ?? s.is_active ?? s.active;
    if (typeof v === "boolean") return v;
    return true;
  };

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as const }}
    >
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Card className="p-4 backdrop-blur-sm shadow-sm hover:shadow-md transition-shadow duration-300">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Badge className="bg-gradient-to-r from-[#FF7B21] to-[#19D6C8] text-white shadow-lg shadow-[#FF7B21]/20">
                  {t("stores.badge")}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {t("stores.description")}
                </span>
              </div>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder={t("stores.searchPlaceholder")}
                  className="w-full sm:w-[320px] pl-9 bg-background/80 backdrop-blur-sm"
                />
              </div>
              <Button
                variant={includeInactive ? "default" : "outline"}
                className={includeInactive ? "bg-gradient-to-r from-[#FF7B21] to-[#19D6C8] hover:from-[#FF8B31] hover:to-[#29E6D8] text-white gap-2" : "gap-2"}
                onClick={() => setIncludeInactive((v) => !v)}
              >
                {includeInactive ? <Eye className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                {t("stores.includeInactive")}
              </Button>
            </div>
          </div>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card className="p-4 hover:shadow-lg transition-shadow duration-300">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold flex items-center gap-2">
              <Store className="h-4 w-4 text-[#FF7B21]" />
              {t("stores.title")}
            </h3>
            <Badge variant="outline" className="border-[#FF7B21]/30 text-[#FF7B21] bg-[#FF7B21]/5">
              {filtered.length.toLocaleString()}
            </Badge>
          </div>

          <div className="mt-4">
            {loading ? (
              <div className="space-y-2">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="py-10 text-center text-sm text-muted-foreground">
                {t("stores.noData")}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gradient-to-r from-[#FF7B21]/5 to-[#19D6C8]/5">
                      <TableHead>{t("stores.columns.name")}</TableHead>
                      <TableHead>{t("stores.columns.address")}</TableHead>
                      <TableHead>{t("stores.columns.phone")}</TableHead>
                      <TableHead>{t("stores.columns.owner")}</TableHead>
                      <TableHead>{t("stores.columns.plan")}</TableHead>
                      <TableHead>{t("stores.columns.subStatus")}</TableHead>
                      <TableHead>{t("stores.columns.endDate")}</TableHead>
                      <TableHead>{t("stores.columns.status")}</TableHead>
                      <TableHead>{t("stores.columns.createdAt")}</TableHead>
                      <TableHead className="text-right">{t("stores.columns.raw")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered
                      .filter((s) => (includeInactive ? true : isActiveStore(s)))
                      .map((s, index) => (
                        <motion.tr
                          key={String(s.id ?? "")}
                          className="cursor-pointer border-b last:border-0 hover:bg-gradient-to-r hover:from-[#FF7B21]/5 hover:to-transparent transition-all duration-200"
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.03 }}
                          onClick={() => {
                            const id = String(s.id ?? "");
                            if (id) navigate(`/admin/stores/${id}`);
                          }}
                        >
                          <TableCell className="max-w-[220px] truncate font-medium">
                            {String(s.storeName ?? s.name ?? "—")}
                          </TableCell>
                          <TableCell className="max-w-[260px] truncate text-muted-foreground">
                            {String(s.address ?? "—")}
                          </TableCell>
                          <TableCell className="max-w-[160px] truncate">
                            {String(s.phone ?? "—")}
                          </TableCell>
                          <TableCell className="max-w-[220px] truncate text-muted-foreground">
                            {String(s.ownerEmail ?? s.owner_email ?? "—")}
                          </TableCell>
                          <TableCell className="max-w-[160px] truncate">
                            {String(s.currentPlan ?? s.planName ?? s.plan_name ?? "—")}
                          </TableCell>
                          <TableCell className="max-w-[160px] truncate text-muted-foreground">
                            {String(s.subscriptionStatus ?? s.subscription_status ?? "—")}
                          </TableCell>
                          <TableCell className="max-w-[160px] truncate text-muted-foreground">
                            {formatDate(String(s.subscriptionEndDate ?? s.subscription_end_date ?? s.endDate ?? s.end_date ?? ""))}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={isActiveStore(s) ? "outline" : "destructive"}
                              className={isActiveStore(s) ? "border-emerald-500/50 text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30" : ""}
                            >
                              {isActiveStore(s)
                                ? t("stores.status.active")
                                : t("stores.status.inactive")}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {formatDate(String(s.createdAt ?? ""))}
                          </TableCell>
                          <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50 transition-all duration-200"
                              onClick={() => {
                                setRawTitle(t("stores.rawTitle", { id: String(s.id ?? "—") }));
                                setRawValue(s);
                                setRawOpen(true);
                              }}
                            >
                              {t("stores.columns.raw")}
                            </Button>
                          </TableCell>
                        </motion.tr>
                      ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </Card>
      </motion.div>

      <JsonViewerDialog
        open={rawOpen}
        onOpenChange={setRawOpen}
        title={rawTitle}
        value={rawValue}
      />
    </motion.div>
  );
}

