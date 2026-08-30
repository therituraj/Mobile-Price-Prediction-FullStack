import { useEffect, useRef } from "react";
import gsap from "gsap";
import PhoneCard from "./PhoneCard";

const SOURCE_LABEL = {
  "tavily+llm": "Live market search, structured by AI",
  tavily: "Live market search",
  local_fallback: "Curated catalogue match",
};

export default function PhoneList({ phones, source }) {
  const listRef = useRef(null);

  useEffect(() => {
    const cards = listRef.current?.querySelectorAll("[data-card]");
    if (!cards?.length) return;
    gsap.fromTo(
      cards,
      { opacity: 0, y: 14 },
      { opacity: 1, y: 0, duration: 0.45, stagger: 0.08, ease: "power2.out", delay: 0.15 }
    );
  }, [phones]);

  if (!phones?.length) return null;

  return (
    <div>
      <div className="flex items-baseline justify-between mb-3">
        <h2 className="font-mono text-[11px] uppercase tracking-wider text-[var(--color-muted)]">Worth a look near this price</h2>
        {source && <span className="font-mono text-[10px] text-[var(--color-muted)]/70">{SOURCE_LABEL[source] || source}</span>}
      </div>
      <ul ref={listRef} className="space-y-2.5">
        {phones.map((p, i) => (
          <PhoneCard phone={p} index={i} key={`${p.name}-${i}`} />
        ))}
      </ul>
    </div>
  );
}
