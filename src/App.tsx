import { Routes, Route, Navigate, Outlet} from "react-router-dom";
import Home from "./pages/Home";
import Onboarding from "./pages/Onboarding";
import Dashboard from "./pages/Dashboard";
import { useEffect, useState } from "react";
import { getProfile } from "./lib/db";
import Generator from "./pages/Generator";
import Catalog from "./pages/Catalog";
import History from "./pages/History";
import Stats from "./pages/Stats";
import Profile from "./pages/Profile";
import MainLayout from "./layout/MainLayout";

interface UserProfile {
  name?: string;
  gender?: string;
}

function ProtectedLayout() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    (async () => {
      const profile = await getProfile();
      if (isMounted) {
        setUser(profile ?? null);
        setLoading(false);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-400 font-medium">
        Загрузка...
      </div>
    );
  }

  return (
    <MainLayout user={user}>
      <Outlet />
    </MainLayout>
  );
}

export default function App() {
  const [isReady, setIsReady] = useState(false);
  const [hasProfile, setHasProfile] = useState(false);
  
  const refreshProfileStatus = async () => {
    const profile = await getProfile();
    if (profile) setHasProfile(true);
  };

  useEffect(() => {
    let isMounted = true;

    (async () => {
      const profile = await getProfile();
      if (isMounted) {
        if (profile) setHasProfile(true);
        setIsReady(true);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, []);

  if (!isReady) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <div className="loader">Загрузка...</div>
      </div>
    );
  }

  return (
    <Routes>
      <Route
        path="/"
        element={hasProfile ? <Navigate to="/dashboard" /> : <Home />}
      />
      <Route
        path="/onboarding"
        element={
          hasProfile ? (
            <Navigate to="/dashboard" />
          ) : (
            <Onboarding onComplete={refreshProfileStatus} />
          )
        }
      />
      <Route
        element={
          hasProfile ? <ProtectedLayout /> : <Navigate to="/onboarding" />
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/generator" element={<Generator />} />
        <Route path="/catalog" element={<Catalog />} />
        <Route path="/history" element={<History />} />
        <Route path="/stats" element={<Stats />} />
        <Route path="/profile" element={<Profile />} />
      </Route>
    </Routes>
  );
}
