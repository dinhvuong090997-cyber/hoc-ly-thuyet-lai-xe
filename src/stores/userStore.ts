import { create } from "zustand";
import type { LicenseClass, UserStats } from "../types";
import { getUserStats, setLicenseClass, addXp } from "../db/operations";
import { USER_ID } from "../constants";

interface UserStore {
  stats: UserStats | null;
  isLoading: boolean;
  load: () => Promise<void>;
  setClass: (lc: LicenseClass) => Promise<void>;
  earnXp: (xp: number) => Promise<void>;
}

export const useUserStore = create<UserStore>((set, get) => ({
  stats: null,
  isLoading: false,

  load: async () => {
    set({ isLoading: true });
    const stats = await getUserStats(USER_ID);
    set({ stats, isLoading: false });
  },

  setClass: async (lc) => {
    await setLicenseClass(USER_ID, lc);
    await get().load();
  },

  earnXp: async (xp) => {
    await addXp(USER_ID, xp);
    await get().load();
  },
}));
