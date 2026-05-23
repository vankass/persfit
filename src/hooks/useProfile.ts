import type { ProfileContextType } from "@/types/profile";
import { createContext, useContext } from "react";

export const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export function useProfile(): ProfileContextType {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error("Функция useProfile должна использоваться внутри ProfileProvider");
  }
  return context;
}