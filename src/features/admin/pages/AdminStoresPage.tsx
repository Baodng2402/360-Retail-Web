import { useEffect, useMemo, useState } from "react";
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

export default function AdminStoresPage() {
  const { t, i18n } = useTranslation("admin");
  const [items, setItems] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(false);
  const [includeInactive, setIncludeInactive] = useState(true);
  const [q, setQ] = useState("");
  const navigate = useNavigate();
  const [rawOpen, setRawOpen] = useState(false);
  const [rawTitle, setRawTitle] = useState("Raw JSON");
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
    <div className="space-y-6">
      <Card className="p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge className="bg-gradient-to-r from-teal-500 to-blue-500 text-white">
                {t("stores.badge")}
              </Badge>
              <span className="text-sm text-muted-foreground">
                {t("stores.description")}
              </span>
            </div>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={t("stores.searchPlaceholder")}
              className="w-full sm:w-[320px]"
            />
            <Button
              variant={includeInactive ? "default" : "outline"}
              className="gap-2"
              onClick={() => setIncludeInactive((v) => !v)}
            >
              {t("stores.includeInactive")}
            </Button>
          </div>
        </div>
      </Card>

      <Card className="p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold">
            {t("stores.title")}
          </h3>
          <Badge variant="outline">
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
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("stores.columns.name")}</TableHead>
                  <TableHead>{t("stores.columns.address")}</TableHead>
                  <TableHead>{t("stores.columns.phone")}</TableHead>
                  <TableHead>{t("stores.columns.status")}</TableHead>
                  <TableHead>{t("stores.columns.createdAt")}</TableHead>
                  <TableHead className="text-right">Raw</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered
                  .filter((s) => (includeInactive ? true : isActiveStore(s)))
                  .map((s) => (
                  <TableRow
                    key={String(s.id ?? "")}
                    className="cursor-pointer hover:bg-muted/60"
                    onClick={() => {
                      const id = String(s.id ?? "");
                      if (id) navigate(`/admin/stores/${id}`);
                    }}
                  >
                    <TableCell className="max-w-[220px] truncate">
                      {String(s.storeName ?? s.name ?? "—")}
                    </TableCell>
                    <TableCell className="max-w-[260px] truncate">
                      {String(s.address ?? "—")}
                    </TableCell>
                    <TableCell className="max-w-[160px] truncate">
                      {String(s.phone ?? "—")}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={isActiveStore(s) ? "outline" : "destructive"}
                        className="text-xs"
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
                        onClick={() => {
                          setRawTitle(`Store raw: ${String(s.id ?? "—")}`);
                          setRawValue(s);
                          setRawOpen(true);
                        }}
                      >
                        Raw
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </Card>

      <JsonViewerDialog
        open={rawOpen}
        onOpenChange={setRawOpen}
        title={rawTitle}
        value={rawValue}
      />
    </div>
  );
}

