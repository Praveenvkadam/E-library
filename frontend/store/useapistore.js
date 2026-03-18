
import { create } from "zustand";

const useApiStore = create((set) => ({
  aiBase: process.env.NEXT_PUBLIC_AI_SERVICE_API_URL || "http://localhost:5001",

  /** Override the base URL at runtime — trailing slash is stripped automatically */
  setAiBase: (url) => set({ aiBase: url.replace(/\/$/, "") }),
}));

export default useApiStore;