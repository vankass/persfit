import { Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import Onboarding from "./pages/Onboarding";
import Dashboard from "./pages/Dashboard";
import { useEffect, useState } from "react";
import { getProfile } from "./lib/db";

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

    return () => { isMounted = false; };
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
      <Route path="/" element={hasProfile ? <Navigate to="/dashboard" /> : <Home />} />
      <Route path="/onboarding" element={hasProfile ? <Navigate to="/dashboard"/> : <Onboarding onComplete={refreshProfileStatus}/>} />
      <Route path="/dashboard" element={hasProfile ? <Dashboard /> : <Navigate to="/onboarding" />} />
    </Routes>
  );
}