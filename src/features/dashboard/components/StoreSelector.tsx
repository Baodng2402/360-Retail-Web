import { useEffect, useState } from "react";
import { Card } from "@/shared/components/ui/card";
import { Label } from "@/shared/components/ui/label";
import { Badge } from "@/shared/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { Store as StoreIcon } from "lucide-react";
import { useStoreStore } from "@/shared/store/storeStore";
import { storesApi } from "@/shared/lib/storesApi";
import type { Store } from "@/shared/types/stores";
import toast from "react-hot-toast";

interface StoreSelectorProps {
  pageDescription?: string;
}

export default function StoreSelector({ pageDescription }: StoreSelectorProps) {
  const { currentStore, switchStore } = useStoreStore();
  const storeId = currentStore?.id;

  const [stores, setStores] = useState<Store[]>([]);
  const [storesLoading, setStoresLoading] = useState(false);
  const [switchingStore, setSwitchingStore] = useState(false);

  const loadStores = async () => {
    try {
      setStoresLoading(true);
      let source: Store[] = [];

      // 1. Thử lấy các store mà user sở hữu
      try {
        source = await storesApi.getMyOwnedStores(true);
      } catch (err) {
        const status = (err as { response?: { status?: number } }).response
          ?.status;
        // Nếu không phải Owner (403) thì bỏ qua, sẽ fallback sang my-store / user-stores
        if (status !== 403) {
          throw err;
        }
      }

      // 2. (Bỏ gọi user-stores/stores-my vì backend chưa có → 404 spam console. Khi backend có endpoint thì bật lại.)

      // 3. Nếu vẫn không có store (ví dụ chỉ là Staff 1 store) thì fallback dùng my-store
      if (!Array.isArray(source) || source.length === 0) {
        try {
          const myStore = await storesApi.getMyStore();
          source = myStore ? [myStore] : [];
        } catch (err) {
          console.error("Error loading my-store:", err);
          source = [];
        }
      }

      if (!Array.isArray(source) || source.length === 0) {
        setStores([]);
        return;
      }

      const sortedStores = [...source].sort((a, b) => {
        if (a.isDefault) return -1;
        if (b.isDefault) return 1;
        if (a.isActive && !b.isActive) return -1;
        if (!a.isActive && b.isActive) return 1;
        return 0;
      });

      setStores(sortedStores);

      const defaultStore =
        sortedStores.find((s) => s.isDefault) ?? sortedStores[0];

      if (defaultStore) {
        const storeStore = useStoreStore.getState();
        if (!currentStore || currentStore.id !== defaultStore.id) {
          storeStore.setCurrentStore(defaultStore);
        }
      }
    } catch (error) {
      console.error("Error loading stores:", error);
      toast.error("Không thể tải danh sách cửa hàng. Vui lòng thử lại.");
    } finally {
      setStoresLoading(false);
    }
  };

  useEffect(() => {
    void loadStores();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleStoreChange = async (storeId: string) => {
    const selectedStore = stores.find((s) => s.id === storeId);
    if (!selectedStore || selectedStore.id === currentStore?.id) {
      return;
    }

    // Nếu store chưa được kích hoạt (isActive = false) thì không cố switch,
    // chỉ giải thích rõ cho người dùng và dừng tại đây.
    if (!selectedStore.isActive) {
      toast.error(
        "Cửa hàng này chưa được kích hoạt vì chưa hoàn tất thanh toán gói dịch vụ. Vui lòng hoàn tất thanh toán khi tạo cửa hàng hoặc liên hệ hỗ trợ.",
      );
      return;
    }

    try {
      setSwitchingStore(true);
      await switchStore(selectedStore);
      toast.success(`Đã chuyển sang cửa hàng: ${selectedStore.storeName}`);
      // Reload page data if needed - each page should handle this in their useEffect
    } catch (error) {
      const err = error as {
        response?: { status?: number; data?: { error?: string; message?: string } };
      };
      const status = err.response?.status;
      const data = err.response?.data;

      // Nếu backend chặn vì hết hạn / chưa có subscription, giải thích rõ cho người dùng
      if (status === 403 && data) {
        const code = data.error;
        const message = data.message;

        if (code === "TrialExpired") {
          toast.error(
            message ||
              "Thời gian dùng thử của cửa hàng này đã hết. Vui lòng mua gói dịch vụ trước khi chuyển sang cửa hàng đó.",
          );
        } else if (code === "SubscriptionExpired") {
          toast.error(
            message ||
              "Gói dịch vụ của cửa hàng này đã hết hạn. Vui lòng gia hạn gói trước khi chuyển sang cửa hàng đó.",
          );
        } else {
          toast.error(
            message ||
              "Không thể chuyển sang cửa hàng này do giới hạn gói dịch vụ. Vui lòng kiểm tra lại subscription.",
          );
        }
      } else {
        console.error("Error switching store:", error);
        toast.error("Không thể chuyển cửa hàng. Vui lòng thử lại.");
      }
    } finally {
      setSwitchingStore(false);
    }
  };

  if (storesLoading) {
    return null;
  }

  if (!currentStore || stores.length === 0) {
    return null;
  }

  const defaultDescription =
    pageDescription ||
    (stores.length > 1
      ? "Chuyển đổi để quản lý dữ liệu của cửa hàng khác"
      : `Quản lý dữ liệu của ${currentStore.storeName}`);

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <StoreIcon className="h-5 w-5 text-muted-foreground" />
          <div>
            <Label className="text-sm font-medium">
              {stores.length > 1 ? "Chọn cửa hàng" : "Cửa hàng hiện tại"}
            </Label>
            <p className="text-xs text-muted-foreground">{defaultDescription}</p>
          </div>
        </div>
        {stores.length > 1 ? (
          <Select
            value={storeId || ""}
            onValueChange={handleStoreChange}
            disabled={switchingStore || storesLoading}
          >
            <SelectTrigger className="w-[300px]" disabled={switchingStore || storesLoading}>
              <SelectValue placeholder="Chọn cửa hàng">
                {currentStore?.storeName}
                {currentStore?.isDefault && " (Mặc định)"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {stores.map((store) => (
                <SelectItem
                  key={store.id}
                  value={store.id}
                  disabled={!store.isActive}
                >
                  {store.storeName}
                  {store.isDefault && " (Mặc định)"}
                  {!store.isActive && " - Chưa kích hoạt"}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <div className="flex items-center gap-2 px-3 py-2 bg-muted rounded-md">
            <span className="text-sm font-medium">{currentStore.storeName}</span>
            {currentStore.isDefault && (
              <Badge variant="secondary" className="text-xs">
                Mặc định
              </Badge>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}
