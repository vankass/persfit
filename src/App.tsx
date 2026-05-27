import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import Welcome from "@/pages/Welcome";
import Onboarding from "@/pages/Onboarding";
import Dashboard from "@/pages/Dashboard";
import Generator from "@/pages/Generator";
import Catalog from "@/pages/Catalog";
import History from "@/pages/History";
import Stats from "@/pages/Stats";
import Profile from "@/pages/Profile";
import MainLayout from "@/layout/MainLayout";
import { useProfile } from "@/hooks/useProfile";

function ProtectedLayout() {
  const { user } = useProfile();

  if (!user) {
    return <Navigate to="/onboarding" replace />;
  }

  return (
    <MainLayout>
      <Outlet />
    </MainLayout>
  );
}

export default function App() {
  const { user, refreshProfile } = useProfile();

  const hasProfile = !!user;

  return (
    <Routes>
      <Route
        path="/"
        element={hasProfile ? <Navigate to="/dashboard" /> : <Welcome />}
      />
      <Route
        path="/onboarding"
        element={
          hasProfile ? (
            <Navigate to="/dashboard" />
          ) : (
            <Onboarding onComplete={refreshProfile} />
          )
        }
      />
      <Route element={<ProtectedLayout />}>
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
