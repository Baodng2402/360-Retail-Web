import { useEffect, useState } from "react";
import { Card } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { storeApi } from "@/shared/lib/storeApi";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";

export function StoreInformationContent() {
  const { t } = useTranslation(["dashboard", "common"]);
  const [storeName, setStoreName] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  // const [store, setStore] = useState({}); // Có thể không cần biến này nếu chỉ dùng để fill form

  useEffect(() => {
    const getStore = async () => {
      try {
        const dataStore = await storeApi.getStore();
        // Kiểm tra xem dataStore có dữ liệu không trước khi set
        if (dataStore) {
          // Mapping dữ liệu từ API vào state của form
          setStoreName(dataStore.storeName || "");
          setAddress(dataStore.address || "");
          setPhone(dataStore.phone || "");
        }
      } catch (error: unknown) {
        console.error("Failed to get store:", error);
        toast.error(t("dashboard:settingsPage.toasts.loadStoreFailed"));
      }
    };
    getStore();
  }, [t]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Logic save giữ nguyên
      const result = await storeApi.createStore({
        storeName,
        address,
        phone,
      });
      console.log("Store created successfully:", result);
      toast.success(t("dashboard:settingsPage.toasts.saveStoreSuccess"));
    } catch (err: unknown) {
      console.error("Failed to create store:", err);
      toast.error(t("dashboard:settingsPage.toasts.saveStoreFailed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6">
      {/* ... Phần JSX giữ nguyên ... */}
      <div className="mb-6">
        <h2 className="text-2xl font-semibold mb-1">{t("dashboard:settingsPage.store.title")}</h2>
        <p className="text-muted-foreground">{t("dashboard:settingsPage.tabs.store")}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="storeName" className="mb-1 block text-sm font-medium">
            {t("dashboard:settingsPage.store.fields.nameLabel")}
          </label>
          <input
            id="storeName"
            type="text"
            value={storeName} // State này giờ đã có dữ liệu từ useEffect
            onChange={(e) => setStoreName(e.target.value)}
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
            placeholder={t("dashboard:settingsPage.store.fields.namePlaceholder")}
            required
          />
        </div>

        {/* Các input Address và Phone tương tự */}
        <div>
          <label
            htmlFor="storeAddress"
            className="mb-1 block text-sm font-medium"
          >
            {t("dashboard:settingsPage.store.fields.addressLabel")}
          </label>
          <input
            id="storeAddress"
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
            placeholder={t("dashboard:settingsPage.store.fields.addressPlaceholder")}
            required
          />
        </div>

        <div>
          <label
            htmlFor="storePhone"
            className="mb-1 block text-sm font-medium"
          >
            {t("dashboard:settingsPage.store.fields.phoneLabel")}
          </label>
          <input
            id="storePhone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
            placeholder={t("dashboard:settingsPage.store.fields.phonePlaceholder")}
            required
          />
        </div>

        <div className="flex justify-end pt-4">
          <Button
            type="submit"
            disabled={loading}
            className="bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading
              ? t("common:states.saving")
              : t("common:actions.saveChanges")}
          </Button>
        </div>
      </form>
    </Card>
  );
}
