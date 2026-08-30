import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import PredictForm from "./../components/PredictForm";
import PriceDial from "./../components/PriceDial";
import PhoneList from "./../components/PhoneList";
import { predictPrice, getCompanies } from "./../lib/api";
import { pushHistory } from "./../lib/history";

export default function Predictor() {
  const [companies, setCompanies] = useState([]);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const heroRef = useRef(null);
  const resultRef = useRef(null);

  useEffect(() => {
    getCompanies()
      .then(setCompanies)
      .catch(() => setCompanies([]));
  }, []);

  useEffect(() => {
    if (!heroRef.current) return;
    gsap.fromTo(heroRef.current, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" });
  }, []);

  useEffect(() => {
    if (result && resultRef.current) {
      gsap.fromTo(resultRef.current, { opacity: 0 }, { opacity: 1, duration: 0.4, ease: "power1.out" });
    }
  }, [result]);

  const handleSubmit = async (payload) => {
    setLoading(true);
    setError(null);
    try {
      const data = await predictPrice(payload);
      setResult(data);
      pushHistory({ input: payload, output: data });
    } catch (err) {
      setError(
        err?.response?.data?.detail ||
          "Couldn't reach the prediction service. Make sure the backend is running on the configured API URL."
      );
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-6 py-14">
      <div ref={heroRef} className="mb-12 max-w-2xl">
        <p className="font-mono text-[11px] uppercase tracking-wider text-[var(--color-accent)] mb-3">Spec → Price</p>
        <h1 className="font-display text-4xl sm:text-5xl font-semibold tracking-tight leading-[1.1]">
          What should this phone actually cost?
        </h1>
        <p className="text-[var(--color-muted)] mt-4 text-[15px] leading-relaxed">
          Give us the rating, RAM and storage — the brand too, if you know it — and our model reads
          the market like a spec sheet: it weighs each figure against thousands of comparable
          configurations to estimate a fair price, then surfaces real phones worth comparing it to.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1.1fr] gap-10 items-start">
        <div className="rounded-2xl min-w-100 border border-[var(--color-line)] bg-[var(--color-surface)] p-7 shadow-[var(--shadow-soft)]">
          <PredictForm companies={companies} onSubmit={handleSubmit} submitting={loading} />
          {error && (
            <p className="mt-4 text-sm text-[var(--color-danger)] font-mono border-t border-[var(--color-line)] pt-4">{error}</p>
          )}
        </div>

        <div className="hidden lg:block w-px self-stretch bg-[var(--color-line)]" />

        <div className="lg:sticky lg:top-8">
          <div className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)] py-8 px-6 flex justify-center shadow-[var(--shadow-soft)]">
            <PriceDial
              price={result?.predicted_price ?? (loading ? 0 : null)}
              low={result?.price_range_low ?? 0}
              high={result?.price_range_high ?? 0}
              loading={loading}
            />
          </div>

          {result && (
            <div ref={resultRef} className="mt-8">
              <PhoneList phones={result.recommendations} source={result.recommendation_source} />
            </div>
          )}

          {!result && !loading && (
            <p className="mt-6 text-center text-sm text-[var(--color-muted)] font-mono">
              Fill in the spec sheet to see an estimate.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
