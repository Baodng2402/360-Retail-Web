import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Card } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { loyaltyPublicApi, type LoyaltyPublicCheckResult } from "@/shared/lib/loyaltyPublicApi";
import { Award, Loader2, QrCode, Search, Store } from "lucide-react";

const isLikelyUuid = (v: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(v);

export default function LoyaltyCheckPage() {
  const [searchParams] = useSearchParams();
  const storeId = (searchParams.get("storeId") ?? "").trim();

  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<LoyaltyPublicCheckResult | null>(null);

  const storeIdError = useMemo(() => {
    if (!storeId) return "Thiếu storeId trong đường dẫn. Vui lòng quét đúng QR hoặc kiểm tra lại link.";
    if (!isLikelyUuid(storeId)) return "storeId không hợp lệ.";
    return "";
  }, [storeId]);

  const submit = async () => {
    if (storeIdError) {
      toast.error(storeIdError);
      return;
    }
    const p = phone.trim();
    if (!p) {
      toast.error("Vui lòng nhập số điện thoại.");
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
        "Tra cứu thất bại.";
      toast.error(message);
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  const rankTone = (rank: string) => {
    const r = rank.trim().toLowerCase();
    if (r.includes("gold")) return "bg-amber-500 text-white";
    if (r.includes("silver")) return "bg-slate-500 text-white";
    if (r.includes("bronze")) return "bg-orange-700 text-white";
    return "bg-emerald-600 text-white";
  };

  return (
    <div className="min-h-[calc(100vh-2rem)] p-4 sm:p-8 bg-gradient-to-b from-background to-muted/30">
      <div className="mx-auto w-full max-w-xl space-y-4">
        <Card className="p-5 sm:p-6">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Badge className="bg-gradient-to-r from-teal-500 to-blue-500 text-white">
                  Loyalty
                </Badge>
                <span className="text-xs text-muted-foreground">Public</span>
              </div>
              <h1 className="text-lg sm:text-xl font-semibold flex items-center gap-2">
                <QrCode className="h-5 w-5 text-teal-600" />
                Tra cứu điểm tích lũy
              </h1>
              <p className="text-xs text-muted-foreground">
                Nhập số điện thoại để xem tên khách hàng, điểm và hạng.
              </p>
            </div>
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-teal-500 to-blue-500 text-white flex items-center justify-center">
              <Award className="h-5 w-5" />
            </div>
          </div>

          <div className="mt-5 space-y-4">
            <div className="space-y-1">
              <Label>Store</Label>
              <div className="flex items-center gap-2">
                <div className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm w-full">
                  <Store className="h-4 w-4 text-muted-foreground" />
                  <span className="truncate">{storeId || "—"}</span>
                </div>
              </div>
              {storeIdError && (
                <div className="text-xs text-red-600">{storeIdError}</div>
              )}
            </div>

            <div className="space-y-1">
              <Label htmlFor="phone">Số điện thoại</Label>
              <Input
                id="phone"
                inputMode="tel"
                placeholder="0901234567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") void submit();
                }}
              />
            </div>

            <Button
              onClick={() => void submit()}
              disabled={loading || !!storeIdError}
              className="w-full bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-600 hover:to-blue-600 gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Đang tra cứu...
                </>
              ) : (
                <>
                  <Search className="h-4 w-4" />
                  Tra cứu
                </>
              )}
            </Button>
          </div>
        </Card>

        <Card className="p-5 sm:p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold">Kết quả</h2>
            {result?.rank ? (
              <Badge className={rankTone(result.rank)}>{result.rank}</Badge>
            ) : (
              <Badge variant="outline">—</Badge>
            )}
          </div>

          <div className="mt-4 grid gap-3">
            {loading ? (
              <>
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </>
            ) : !result ? (
              <div className="rounded-md border p-4 text-sm text-muted-foreground">
                Chưa có dữ liệu. Vui lòng nhập số điện thoại để tra cứu.
              </div>
            ) : (
              <>
                <div className="rounded-md border p-4 flex items-center justify-between gap-3">
                  <span className="text-sm text-muted-foreground">Khách hàng</span>
                  <span className="text-sm font-semibold truncate">{result.customerName}</span>
                </div>
                <div className="rounded-md border p-4 flex items-center justify-between gap-3">
                  <span className="text-sm text-muted-foreground">Tổng điểm</span>
                  <span className="text-sm font-semibold">
                    {Number.isFinite(result.totalPoints)
                      ? result.totalPoints.toLocaleString()
                      : String(result.totalPoints)}
                  </span>
                </div>
              </>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

