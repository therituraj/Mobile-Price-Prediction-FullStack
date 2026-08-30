import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { getHistory, clearHistory } from "./../lib/history";

function formatTime(ts) {
  return new Date(ts).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });
}

export default function History() {
  const [items, setItems] = useState([]);
  const listRef = useRef(null);

  useEffect(() => {
    setItems(getHistory());
  }, []);

  useEffect(() => {
    const rows = listRef.current?.querySelectorAll("[data-row]");
    if (!rows?.length) return;
    gsap.fromTo(rows, { opacity: 0, x: -8 }, { opacity: 1, x: 0, duration: 0.4, stagger: 0.05, ease: "power2.out" });
  }, [items]);

  const handleClear = () => {
    clearHistory();
    setItems([]);
  };

  return (
    <div className="mx-auto max-w-3xl px-6 py-14">
      <div className="flex items-baseline justify-between mb-8">
        <h1 className="font-display text-3xl font-semibold tracking-tight">History</h1>
        {items.length > 0 && (
          <button onClick={handleClear} className="font-mono text-xs text-[var(--color-muted)] hover:text-[var(--color-danger)] transition-colors cursor-pointer">
            Clear all
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[var(--color-line)] p-10 text-center">
          <p className="text-[var(--color-muted)] text-sm">
            No estimates yet. Run a prediction and it'll show up here — stored locally on this device.
          </p>
        </div>
      ) : (
        <ul ref={listRef} className="space-y-3">
          {items.map((item) => (
            <li
              data-row
              key={item.id}
              className="rounded-xl border border-[var(--color-line)] bg-[var(--color-surface)] p-5 flex items-center justify-between gap-4"
            >
              <div className="min-w-0">
                <div className="font-mono text-[10px] text-[var(--color-muted)] uppercase tracking-wider mb-1">
                  {formatTime(item.timestamp)}
                </div>
                <div className="font-display font-medium">
                  {item.input.company || "Any brand"} · {item.input.ram_gb}GB / {item.input.rom_gb}GB · {item.input.rating.toFixed(1)}★
                </div>
              </div>
              <div className="font-mono text-lg shrink-0">₹{Math.round(item.output.predicted_price).toLocaleString("en-IN")}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
