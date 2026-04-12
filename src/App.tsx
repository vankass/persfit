import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Onboarding from "./pages/Onboarding";
import Dashboard from "./pages/Dashboard";
import { useEffect, useState } from "react";
import { getProfile } from "./lib/db";

export default function App() {
  const [isReady, setIsReady] = useState(false);
  const [hasProfile, setHasProfile] = useState(false);

  useEffect(() => {
    const checkUser = async () => {
      const profile = await getProfile();
      if (profile) setHasProfile(true);
      setIsReady(true);
    };
    checkUser();
  }, []);

  if (!isReady) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div className="loader">Загрузка...</div> 
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={hasProfile ? <Dashboard /> : <Home />} />
      <Route path="/onboarding" element={<Onboarding />} />
      <Route path="/dashboard" element={<Dashboard />} />
    </Routes>
  );
}