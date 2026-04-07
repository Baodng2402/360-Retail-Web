import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { motion } from "motion/react";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Card } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { loyaltyPublicApi, type LoyaltyPublicCheckResult } from "@/shared/lib/loyaltyPublicApi";
import { Award, Loader2, QrCode, Search, Store } from "lucide-react";
import { cn } from "@/lib/utils";
import i18next from "@/i18n";

const isLikelyUuid = (v: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(v);

export default function LoyaltyCheckPage() {
  const t = (key: string, options?: Record<string, unknown>) =>
    String((i18next.t as unknown as (k: string, o?: Record<string, unknown>) => unknown)(key, options));
  const [searchParams] = useSearchParams();
  const storeId = (searchParams.get("storeId") ?? "").trim();

  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<LoyaltyPublicCheckResult | null>(null);

  const storeIdError = useMemo(() => {
    if (!storeId) return t("common:pages.loyaltyCheck.errors.missingStoreId");
    if (!isLikelyUuid(storeId)) return t("common:pages.loyaltyCheck.errors.invalidStoreId");
    return "";
  }, [storeId]);

  const submit = async () => {
    if (storeIdError) {
      toast.error(storeIdError);
      return;
    }
    const p = phone.trim();
    if (!p) {
      toast.error(t("common:pages.loyaltyCheck.errors.phoneRequired"));
      return;
    }

    try {
      setLoading(true);
      setResult(null);
      const data = await loyaltyPublicApi.check({ phone: p, storeId });
      setResult(data);
    } catch (err) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        (err as Error)?.message ||
        t("common:pages.loyaltyCheck.errors.lookupFailed");
      toast.error(message);
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  const rankTone = (rank: string) => {
    const r = rank.trim().toLowerCase();
    if (r.includes("gold")) return "bg-gradient-to-r from-amber-400 to-yellow-500 text-white shadow-lg shadow-amber-500/20";
    if (r.includes("silver")) return "bg-gradient-to-r from-slate-400 to-slate-600 text-white shadow-lg shadow-slate-500/20";
    if (r.includes("bronze")) return "bg-gradient-to-r from-orange-600 to-orange-800 text-white shadow-lg shadow-orange-600/20";
    return "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/20";
  };

  return (
    <div className="min-h-[calc(100vh-2rem)] p-4 sm:p-8 bg-gradient-to-b from-background via-white to-[#FF7B21]/5 dark:from-gray-900 dark:via-gray-800 dark:to-[#FF7B21]/5">
      <div className="mx-auto w-full max-w-xl space-y-4">
        {/* Header Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          <Card className="p-5 sm:p-6 transition-all duration-300 hover:shadow-xl hover:shadow-[#FF7B21]/5 border-[#FF7B21]/10 dark:border-[#FF7B21]/20 overflow-hidden relative">
            {/* Gradient accent bar */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#FF7B21] to-[#19D6C8]" />

            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Badge className="bg-gradient-to-r from-[#FF7B21] to-[#19D6C8] text-white border-0 shadow-md shadow-[#FF7B21]/20">
                    {t("common:pages.loyaltyCheck.badges.loyalty")}
                  </Badge>
                  <span className="text-xs text-muted-foreground">{t("common:pages.loyaltyCheck.badges.public")}</span>
                </div>
                <motion.h1
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                  className="text-lg sm:text-xl font-semibold flex items-center gap-2"
                >
                  <QrCode className="h-5 w-5 text-[#FF7B21]" />
                  {t("common:pages.loyaltyCheck.title")}
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.15 }}
                  className="text-xs text-muted-foreground"
                >
                  {t("common:pages.loyaltyCheck.subtitle")}
                </motion.p>
              </div>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                className="h-10 w-10 rounded-full bg-gradient-to-br from-[#FF7B21] to-[#19D6C8] text-white flex items-center justify-center shadow-lg shadow-[#FF7B21]/20"
              >
                <Award className="h-5 w-5" />
              </motion.div>
            </div>

            <div className="mt-5 space-y-4">
              {/* Store ID Field */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="space-y-1"
              >
                <Label className="text-sm font-medium text-foreground">{t("common:pages.loyaltyCheck.storeLabel")}</Label>
                <div className="flex items-center gap-2">
                  <div className="inline-flex items-center gap-2 rounded-lg border bg-gradient-to-r from-[#FF7B21]/5 to-[#19D6C8]/5 px-3 py-2 text-sm w-full border-[#FF7B21]/20">
                    <Store className="h-4 w-4 text-[#FF7B21]" />
                    <span className="truncate font-medium">{storeId || "—"}</span>
                  </div>
                </div>
                {storeIdError && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-xs text-red-500 font-medium"
                  >
                    {storeIdError}
                  </motion.div>
                )}
              </motion.div>

              {/* Phone Input */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="space-y-1"
              >
                <Label htmlFor="phone" className="text-sm font-medium text-foreground">{t("common:pages.loyaltyCheck.phoneLabel")}</Label>
                <Input
                  id="phone"
                  inputMode="tel"
                  placeholder="0901234567"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") void submit();
                  }}
                  className="h-11 transition-all focus-visible:ring-2 focus-visible:ring-[#FF7B21]/50 focus-visible:border-[#FF7B21] bg-gradient-to-r from-white to-[#FF7B21]/5 dark:from-gray-900 dark:to-[#FF7B21]/10"
                />
              </motion.div>

              {/* Search Button */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  onClick={() => void submit()}
                  disabled={loading || !!storeIdError}
                  className="w-full h-11 bg-gradient-to-r from-[#FF7B21] to-[#19D6C8] hover:from-[#FF7B21]/90 hover:to-[#19D6C8]/90 shadow-lg shadow-[#FF7B21]/20 hover:shadow-xl hover:shadow-[#FF7B21]/30 border-0 transition-all duration-300 font-semibold gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {t("common:pages.loyaltyCheck.actions.searching")}
                    </>
                  ) : (
                    <>
                      <Search className="h-4 w-4" />
                      {t("common:pages.loyaltyCheck.actions.search")}
                    </>
                  )}
                </Button>
              </motion.div>
            </div>
          </Card>
        </motion.div>

        {/* Result Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut", delay: 0.15 }}
        >
          <Card className="p-5 sm:p-6 transition-all duration-300 hover:shadow-xl hover:shadow-[#FF7B21]/5 border-[#FF7B21]/10 dark:border-[#FF7B21]/20 overflow-hidden relative">
            {/* Gradient accent bar */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#19D6C8] to-[#FF7B21]" />

            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="flex items-center justify-between mb-4"
            >
              <h2 className="text-base font-semibold flex items-center gap-2">
                <Award className="h-5 w-5 text-[#FF7B21]" />
                {t("common:pages.loyaltyCheck.result.title")}
              </h2>
              {result?.rank ? (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200 }}
                >
                  <Badge className={cn("text-xs px-3 py-1 font-semibold border-0", rankTone(result.rank))}>
                    {result.rank}
                  </Badge>
                </motion.div>
              ) : (
                <Badge variant="outline" className="text-xs border-[#FF7B21]/30 text-[#FF7B21]">—</Badge>
              )}
            </motion.div>

            <div className="mt-4 grid gap-3">
              {loading ? (
                <>
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <Skeleton className="h-12 w-full rounded-lg" />
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.15 }}
                  >
                    <Skeleton className="h-12 w-full rounded-lg" />
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <Skeleton className="h-12 w-full rounded-lg" />
                  </motion.div>
                </>
              ) : !result ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="rounded-lg border border-dashed border-[#FF7B21]/30 p-6 text-sm text-muted-foreground text-center bg-gradient-to-br from-[#FF7B21]/5 to-transparent"
                >
                  <Search className="h-8 w-8 mx-auto mb-2 text-[#FF7B21]/40" />
                  {t("common:pages.loyaltyCheck.states.emptyHint")}
                </motion.div>
              ) : (
                <>
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="rounded-lg border p-4 flex items-center justify-between gap-3 bg-gradient-to-r from-[#FF7B21]/5 to-transparent dark:from-[#FF7B21]/10 transition-all hover:shadow-md hover:shadow-[#FF7B21]/5"
                  >
                    <span className="text-sm text-muted-foreground flex items-center gap-2">
                      <Award className="h-4 w-4 text-[#FF7B21]" />
                      {t("common:pages.loyaltyCheck.result.customerLabel")}
                    </span>
                    <span className="text-sm font-semibold truncate bg-gradient-to-r from-[#FF7B21] to-[#19D6C8] bg-clip-text text-transparent">
                      {result.customerName}
                    </span>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.15 }}
                    className="rounded-lg border p-4 flex items-center justify-between gap-3 bg-gradient-to-r from-[#19D6C8]/5 to-transparent dark:from-[#19D6C8]/10 transition-all hover:shadow-md hover:shadow-[#19D6C8]/5"
                  >
                    <span className="text-sm text-muted-foreground flex items-center gap-2">
                      <Search className="h-4 w-4 text-[#19D6C8]" />
                      {t("common:pages.loyaltyCheck.result.totalPointsLabel")}
                    </span>
                    <span className="text-sm font-bold text-lg bg-gradient-to-r from-[#19D6C8] to-[#FF7B21] bg-clip-text text-transparent">
                      {Number.isFinite(result.totalPoints)
                        ? result.totalPoints.toLocaleString(i18next.language)
                        : String(result.totalPoints)}
                    </span>
                  </motion.div>
                </>
              )}
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
