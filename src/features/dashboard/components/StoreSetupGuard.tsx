import { useState, useEffect } from "react";
import { authApi } from "@/shared/lib/authApi";
import { StoreFormDialog } from "./StoreFormDialog";
import toast from "react-hot-toast";

interface StoreSetupGuardProps {
  children: React.ReactNode;
}

export const StoreSetupGuard = ({ children }: StoreSetupGuardProps) => {
  const [checking, setChecking] = useState(true);
  const [needsStore, setNeedsStore] = useState(false);
  const [savingStore, setSavingStore] = useState(false);
  const [storeForm, setStoreForm] = useState({
    storeName: "",
    address: "",
    phone: "",
    isActive: true,
  });

  useEffect(() => {
    checkUserStores();
  }, []);

  const checkUserStores = async () => {
    try {
      setChecking(true);
      const subscriptionStatus = await authApi.checkStoreTrial();

      setNeedsStore(!subscriptionStatus.hasStore);
    } catch (error) {
      console.error("Failed to check user stores:", error);
      toast.error("Không thể kiểm tra cửa hàng. Vui lòng thử lại.");
      setNeedsStore(true);
    } finally {
      setChecking(false);
    }
  };

  const handleCreateStore = async () => {
    if (!storeForm.storeName.trim()) {
      toast.error("Vui lòng nhập tên cửa hàng");
      return;
    }

    if (savingStore) {
      return;
    }

    try {
      setSavingStore(true);
      await authApi.createStoreTrial({
        storeName: storeForm.storeName,
      });

      toast.success("Tạo cửa hàng thành công!");
      localStorage.setItem("token", refreshRes.accessToken);

      setNeedsStore(false);
    } catch (error) {
      console.error("Failed to create store:", error);
      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message || "Không thể tạo cửa hàng";
      toast.error(errorMessage);
    } finally {
      setSavingStore(false);
    }
  };

  if (checking) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Đang kiểm tra thông tin...</p>
        </div>
      </div>
    );
  }

  if (needsStore) {
    return (
      <StoreFormDialog
        open={true}
        onOpenChange={() => {}}
        isEditing={false}
        formData={storeForm}
        onFormChange={setStoreForm}
        onSave={handleCreateStore}
        isSaving={savingStore}
        mandatory={true}
      />
    );
  }

  return <>{children}</>;
};
