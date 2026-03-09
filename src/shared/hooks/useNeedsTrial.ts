import { useEffect, useState } from "react";

import { authApi } from "@/shared/lib/authApi";
import { UserStatus } from "@/shared/types/jwt-claims";

export function useNeedsTrial() {
  const [needsTrial, setNeedsTrial] = useState(false);
  const [loading, setLoading] = useState(true);

  const checkStatus = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        setNeedsTrial(false);
        return false;
      }

      const userInfo = await authApi.meWithSubscription();
      const needs = userInfo.status === UserStatus.Registered || !userInfo.storeId;
      setNeedsTrial(needs);
      return needs;
    } catch {
      setNeedsTrial(false);
      return false;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void checkStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { needsTrial, loading, checkStatus };
}

