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

  useEffect(() => {
    loadStores();
  }, []);

  const loadStores = async () => {
    try {
      setStoresLoading(true);
      const data = await storesApi.getMyOwnedStores();

      // Sort stores: default first, then active, then inactive
      const sortedStores = [...data].sort((a, b) => {
        if (a.isDefault) return -1;
        if (b.isDefault) return 1;
        if (a.isActive && !b.isActive) return -1;
        if (!a.isActive && b.isActive) return 1;
        return 0;
      });

      setStores(sortedStores);

      // Get the current store from token (store with isDefault = true)
      const defaultStore = data.find((s) => s.isDefault);

      // Sync currentStore with the actual default store from token
      if (defaultStore) {
        // If currentStore doesn't match the default store, sync it
        if (!currentStore || currentStore.id !== defaultStore.id) {
          // Use setCurrentStore instead of switchStore to avoid unnecessary token refresh
          // since token is already for this store
          const storeStore = useStoreStore.getState();
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

  const handleStoreChange = async (storeId: string) => {
    const selectedStore = stores.find((s) => s.id === storeId);
    if (!selectedStore || selectedStore.id === currentStore?.id) {
      return;
    }

    try {
      setSwitchingStore(true);
      await switchStore(selectedStore);
      toast.success(`Đã chuyển sang cửa hàng: ${selectedStore.storeName}`);
      // Reload page data if needed - each page should handle this in their useEffect
    } catch (error) {
      console.error("Error switching store:", error);
      toast.error("Không thể chuyển cửa hàng. Vui lòng thử lại.");
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
                <SelectItem key={store.id} value={store.id}>
                  {store.storeName}
                  {store.isDefault && " (Mặc định)"}
                  {!store.isActive && " - Ngừng hoạt động"}
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
