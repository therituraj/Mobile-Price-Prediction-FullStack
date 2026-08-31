import { Routes, Route, useLocation } from "react-router-dom";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import Navbar from "./components/Navbar";
import Predictor from "./pages/Predictor";
import History from "./pages/History";
import About from "./pages/About";
import PredictorV2 from "./pages/ PredictPriceV2"

function PageTransition({ children }) {
  const ref = useRef(null);
  const location = useLocation();

  useEffect(() => {
    if (!ref.current) return;
    gsap.fromTo(ref.current, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.35, ease: "power2.out" });
  }, [location.pathname]);

  return <div ref={ref}>{children}</div>;
}

export default function App() {
  return (
    <div className="min-h-full flex flex-col">
      <Navbar />
      <main className="flex-1">
        <PageTransition>
          <Routes>
            <Route path="/" element={<Predictor />} />
            <Route path="/history" element={<History />} />
            <Route path="/predictv2" element={<PredictorV2 />} />
            <Route path="/about" element={<About />} />
          </Routes>
        </PageTransition>
      </main>
      <footer className="border-t border-[var(--color-line)]">
        <div className="mx-auto max-w-5xl px-6 py-6 flex items-center justify-between font-mono text-[11px] text-[var(--color-muted)]">
          <span>PhonePredict · Mobile Price Prediction</span>
          <span>Made By <a href="http://therituraj.in" target="_blank" rel="noopener noreferrer" className="text-accent">Ritu Raj</a></span>
        </div>
      </footer>
    </div>
  );
}
