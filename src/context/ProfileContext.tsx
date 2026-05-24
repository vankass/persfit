import { Loader } from "@/components/Loader";
import { ProfileContext } from "@/hooks/useProfile";
import { getProfile } from "@/lib/db";
import type { UserProfile } from "@/types/profile";
import { useEffect, useState, type ReactNode } from "react";

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshProfile = async () => {
    try {
      const profile = await getProfile();
      setUser(profile ?? null);
    } catch (error) {
      console.error("Не удалось загрузить профиль:", error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshProfile();
  }, []);

  if (loading) {
    return <Loader />;
  }

  return (
    <ProfileContext.Provider value={{ user, refreshProfile }}>
      {children}
    </ProfileContext.Provider>
  );
}
