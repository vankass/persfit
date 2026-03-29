import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Onboarding from "./pages/OnBoarding";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/onboarding" element={<Onboarding />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;