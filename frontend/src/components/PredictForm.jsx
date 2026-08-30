import { useEffect, useRef, useState } from "react";
import gsap from "gsap";

const RAM_OPTIONS = [1, 2, 3, 4, 6, 8, 12, 16, 24, 32, 64];
const ROM_OPTIONS = [4, 8, 16, 32, 64, 128, 256, 512, 1024];

export default function PredictForm({ companies, onSubmit, submitting }) {
  const [company, setCompany] = useState("");
  const [rating, setRating] = useState(4.2);
  const [ram, setRam] = useState(8);
  const [rom, setRom] = useState(128);
  const formRef = useRef(null);

  useEffect(() => {
    const fields = formRef.current?.querySelectorAll("[data-field]");
    if (!fields?.length) return;
    gsap.fromTo(
      fields,
      { opacity: 0, y: 10 },
      { opacity: 1, y: 0, duration: 0.5, stagger: 0.07, ease: "power2.out" }
    );
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ company: company.trim(), rating, ram_gb: ram, rom_gb: rom });
  };

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-7">
      <div data-field>
        <label htmlFor="company" className="block font-mono text-[11px] uppercase tracking-wider text-[var(--color-muted)] mb-2">
          Company <span className="normal-case text-[var(--color-muted)]/70">(optional, helps accuracy)</span>
        </label>
        <input
          id="company"
          list="company-options"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          placeholder="e.g. Samsung, Apple, Xiaomi…"
          className="w-full rounded-xl border border-[var(--color-line)] bg-[var(--color-surface)] px-4 py-3 text-[15px] outline-none focus:border-[var(--color-accent)] transition-colors placeholder:text-[var(--color-muted)]/60"
        />
        <datalist id="company-options">
          {companies.map((c) => (
            <option value={c} key={c} />
          ))}
        </datalist>
      </div>

      <div data-field>
        <div className="flex items-baseline justify-between mb-2">
          <label htmlFor="rating" className="font-mono text-[11px] uppercase tracking-wider text-[var(--color-muted)]">
            Rating
          </label>
          <span className="font-mono text-sm text-[var(--color-ink)]">{rating.toFixed(1)} / 5.0</span>
        </div>
        <input
          id="rating"
          type="range"
          min="1"
          max="5"
          step="0.1"
          value={rating}
          onChange={(e) => setRating(parseFloat(e.target.value))}
          className="w-full accent-[var(--color-accent)]"
        />
      </div>

      <div data-field className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="ram" className="block font-mono text-[11px] uppercase tracking-wider text-[var(--color-muted)] mb-2">
            RAM (GB)
          </label>
          <select
            id="ram"
            value={ram}
            onChange={(e) => setRam(Number(e.target.value))}
            className="w-full rounded-xl border border-[var(--color-line)] bg-[var(--color-surface)] px-4 py-3 text-[15px] outline-none focus:border-[var(--color-accent)] transition-colors font-mono"
          >
            {RAM_OPTIONS.map((v) => (
              <option key={v} value={v}>
                {v} GB
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="rom" className="block font-mono text-[11px] uppercase tracking-wider text-[var(--color-muted)] mb-2">
            Storage (GB)
          </label>
          <select
            id="rom"
            value={rom}
            onChange={(e) => setRom(Number(e.target.value))}
            className="w-full rounded-xl border border-[var(--color-line)] bg-[var(--color-surface)] px-4 py-3 text-[15px] outline-none focus:border-[var(--color-accent)] transition-colors font-mono"
          >
            {ROM_OPTIONS.map((v) => (
              <option key={v} value={v}>
                {v} GB
              </option>
            ))}
          </select>
        </div>
      </div>

      <button
        data-field
        type="submit"
        disabled={submitting}
        className="w-full rounded-xl bg-[var(--color-accent)] text-[var(--color-accent-ink)] font-medium py-3.5 transition-all hover:brightness-95 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
      >
        {submitting ? "Estimating…" : "Estimate price"}
      </button>
    </form>
  );
}
