import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import PriceDial from "./../components/PriceDial";
import {predictPriceV2API} from "./../lib/api"

// Keep this in one place so it's easy to swap for your real api client later.
async function predictPriceV2(payload) {
  const res = await predictPriceV2API(payload)
  console.log(res)
  if (!res.success) {
    const err = new Error("Prediction request failed");
    throw err;
  }

  return res.price; // { price: number }
}

const FIELDS = [
  {
    id: "rating",
    label: "Rating",
    unit: "/100",
    hint: "Overall mobile rating",
    min: 0,
    max: 100,
    step: 1,
    placeholder: 85,
  },
  {
    id: "ram_gb",
    label: "RAM",
    unit: "GB",
    hint: "Available RAM capacity",
    min: 1,
    step: 1,
    placeholder: 8,
  },
  {
    id: "storage_gb",
    label: "Storage",
    unit: "GB",
    hint: "Internal storage capacity",
    min: 8,
    step: 1,
    placeholder: 128,
  },
  {
    id: "battery_mah",
    label: "Battery",
    unit: "mAh",
    hint: "Battery capacity",
    min: 500,
    step: 100,
    placeholder: 5000,
  },
  {
    id: "display_inches",
    label: "Display Size",
    unit: "inch",
    hint: "Screen diagonal size",
    min: 3,
    max: 10,
    step: 0.1,
    placeholder: 6.5,
  },
  {
    id: "refresh_hz",
    label: "Refresh Rate",
    unit: "Hz",
    hint: "Display refresh rate",
    min: 30,
    step: 1,
    placeholder: 120,
  },
  {
    id: "rear_camera_mp",
    label: "Rear Camera",
    unit: "MP",
    hint: "Main rear camera resolution",
    min: 1,
    step: 1,
    placeholder: 50,
  },
];

const EMPTY_VALUES = FIELDS.reduce((acc, f) => {
  acc[f.id] = "";
  return acc;
}, {});

function SpecField({ field, value, onChange }) {
  return (
    <div data-field>
      <label
        htmlFor={field.id}
        className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider text-[var(--color-muted)] mb-2"
      >
        {field.label}
      </label>

      <div className="relative">
        <input
          id={field.id}
          name={field.id}
          type="number"
          min={field.min}
          max={field.max}
          step={field.step}
          placeholder={String(field.placeholder)}
          value={value}
          onChange={(e) => onChange(field.id, e.target.value)}
          required
          className="w-full rounded-xl border border-[var(--color-line)] bg-[var(--color-surface)] px-4 py-3 pr-14 text-[15px] outline-none focus:border-[var(--color-accent)] transition-colors placeholder:text-[var(--color-muted)]/60 font-mono [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        />
        <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 font-mono text-xs text-[var(--color-muted)]">
          {field.unit}
        </span>
      </div>

      <p className="mt-1.5 text-xs text-[var(--color-muted)]/80">{field.hint}</p>
    </div>
  );
}

export default function PredictorV2() {
  const [values, setValues] = useState(EMPTY_VALUES);
  const [price, setPrice] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const heroRef = useRef(null);
  const formRef = useRef(null);
  const resultRef = useRef(null);

  useEffect(() => {
    if (!heroRef.current) return;
    gsap.fromTo(
      heroRef.current,
      { opacity: 0, y: 16 },
      { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }
    );
  }, []);

  useEffect(() => {
    const fields = formRef.current?.querySelectorAll("[data-field]");
    if (!fields?.length) return;
    gsap.fromTo(
      fields,
      { opacity: 0, y: 10 },
      { opacity: 1, y: 0, duration: 0.5, stagger: 0.05, ease: "power2.out" }
    );
  }, []);

  useEffect(() => {
    if (price != null && resultRef.current) {
      gsap.fromTo(
        resultRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.4, ease: "power1.out" }
      );
    }
  }, [price]);

  const handleChange = (id, val) => {
    setValues((prev) => ({ ...prev, [id]: val }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const payload = FIELDS.reduce((acc, f) => {
      acc[f.id] = f.step && f.step < 1 ? parseFloat(values[f.id]) : Number(values[f.id]);
      return acc;
    }, {});

    try {
      console.log(payload)

      const data = await predictPriceV2(payload);
      console.log(data)
      setPrice(data);
    } catch (err) {
      setError(
        "Couldn't reach the prediction service. Make sure the backend is running on the configured API URL."
      );
      setPrice(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-6 py-14">
      <div ref={heroRef} className="mb-12 max-w-2xl">
        <p className="font-mono text-[11px] uppercase tracking-wider text-[var(--color-accent)] mb-3">
          Spec → Price
        </p>
        <h1 className="font-display text-4xl sm:text-5xl font-semibold tracking-tight leading-[1.1]">
          What should this phone actually cost?
        </h1>
        <p className="text-[var(--color-muted)] mt-4 text-[15px] leading-relaxed">
          Full spec sheet in, single price out. Rating, RAM, storage, battery, display,
          refresh rate and camera all feed the model directly — no brand needed this time.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1.1fr] gap-10 items-start">
        <div className="rounded-2xl min-w-150 border border-[var(--color-line)] bg-[var(--color-surface)] p-7 shadow-[var(--shadow-soft)]">
          <form ref={formRef} onSubmit={handleSubmit} className="space-y-7">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-7">
              {FIELDS.map((field) => (
                <SpecField
                  key={field.id}
                  field={field}
                  value={values[field.id]}
                  onChange={handleChange}
                />
              ))}
            </div>

            <button
              data-field
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-[var(--color-accent)] text-[var(--color-accent-ink)] font-medium py-3.5 transition-all hover:brightness-95 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? "Estimating…" : "Predict mobile price"}
            </button>
          </form>

          {error && (
            <p className="mt-4 text-sm text-[var(--color-danger)] font-mono border-t border-[var(--color-line)] pt-4">
              {error}
            </p>
          )}
        </div>

        <div className="hidden lg:block w-px self-stretch bg-[var(--color-line)]" />

        <div className="lg:sticky lg:top-8">
          <div className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)] py-8 px-6 flex justify-center shadow-[var(--shadow-soft)]">
            <PriceDial
              price={price ?? (loading ? 0 : null)}
              low={price ?? 0}
              high={price ?? 0}
              loading={loading}
            />
          </div>

          {price != null && (
            <div ref={resultRef} className="mt-8 text-center">
              <p className="font-mono text-[11px] uppercase tracking-wider text-[var(--color-muted)]">
                Estimated price
              </p>
              <p className="font-display text-3xl font-semibold mt-1">
                ₹{price.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
              </p>
            </div>
          )}

          {price == null && !loading && (
            <p className="mt-6 text-center text-sm text-[var(--color-muted)] font-mono">
              Fill in the spec sheet to see an estimate.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}