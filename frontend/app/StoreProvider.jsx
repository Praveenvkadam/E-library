"use client";

import { useEffect } from "react";
import useAuthStore from "@/apis/auth/authstore";

export default function StoreProvider({ children }) {
  useEffect(() => {
    // Manually rehydrate after client mounts — pairs with skipHydration: true
    useAuthStore.persist.rehydrate();
  }, []);

  return children;
}