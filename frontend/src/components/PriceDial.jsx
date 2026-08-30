// import { useEffect, useMemo, useRef } from "react";
// import gsap from "gsap";

// // Gauge sweeps from -120deg to +120deg (240deg arc) across [min, max]
// const START_ANGLE = -120;
// const END_ANGLE = 120;

// function angleForValue(value, min, max) {
//   const clamped = Math.min(Math.max(value, min), max);
//   const ratio = (clamped - min) / (max - min || 1);
//   return START_ANGLE + ratio * (END_ANGLE - START_ANGLE);
// }

// function polar(cx, cy, r, angleDeg) {
//   const rad = ((angleDeg - 90) * Math.PI) / 180;
//   return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
// }

// export default function PriceDial({ price, low, high, loading }) {
//   const needleRef = useRef(null);
//   const numberRef = useRef(null);
//   const arcRef = useRef(null);

//   const min = 0;
//   const max = useMemo(() => Math.max(high * 1.15, 10000), [high]);

//   const size = 260;
//   const cx = size / 2;
//   const cy = size / 2 + 10;
//   const radius = 96;

//   const ticks = useMemo(() => {
//     const arr = [];
//     const count = 12;
//     for (let i = 0; i <= count; i++) {
//       const angle = START_ANGLE + (i / count) * (END_ANGLE - START_ANGLE);
//       const outer = polar(cx, cy, radius + 10, angle);
//       const inner = polar(cx, cy, radius + (i % 3 === 0 ? 0 : 4), angle);
//       arr.push({ outer, inner, major: i % 3 === 0 });
//     }
//     return arr;
//   }, []);

//   const bandStart = polar(cx, cy, radius, angleForValue(low, min, max));
//   const bandEnd = polar(cx, cy, radius, angleForValue(high, min, max));
//   const bandLargeArc = angleForValue(high, min, max) - angleForValue(low, min, max) > 180 ? 1 : 0;

//   useEffect(() => {
//     if (loading) {
//       gsap.to(needleRef.current, {
//         rotation: () => gsap.utils.random(-40, 40),
//         duration: 0.4,
//         repeat: -1,
//         yoyo: true,
//         ease: "sine.inOut",
//         transformOrigin: "50% 100%",
//       });
//       return () => gsap.killTweensOf(needleRef.current);
//     }

//     if (price == null) return;

//     const targetAngle = angleForValue(price, min, max);
//     const tl = gsap.timeline();
//     tl.to(needleRef.current, {
//       rotation: targetAngle,
//       duration: 1.1,
//       ease: "elastic.out(1, 0.65)",
//       transformOrigin: "50% 100%",
//     });

//     const counter = { val: 0 };
//     tl.to(
//       counter,
//       {
//         val: price,
//         duration: 1.0,
//         ease: "power2.out",
//         onUpdate: () => {
//           if (numberRef.current) {
//             numberRef.current.textContent = Math.round(counter.val).toLocaleString("en-IN");
//           }
//         },
//       },
//       "<"
//     );

//     gsap.fromTo(arcRef.current, { strokeDashoffset: 700 }, { strokeDashoffset: 0, duration: 1.3, ease: "power3.out" });

//     return () => tl.kill();
//   }, [price, loading, min, max]);

//   return (
//     <div className="flex flex-col items-center select-none">
//       <svg width={size} height={size / 2 + 60} viewBox={`0 0 ${size} ${size / 2 + 60}`} className="overflow-visible">
//         {/* base track */}
//         <path
//           d={`M ${polar(cx, cy, radius, START_ANGLE).x} ${polar(cx, cy, radius, START_ANGLE).y} A ${radius} ${radius} 0 1 1 ${
//             polar(cx, cy, radius, END_ANGLE).x
//           } ${polar(cx, cy, radius, END_ANGLE).y}`}
//           fill="none"
//           stroke="var(--color-line)"
//           strokeWidth="10"
//           strokeLinecap="round"
//         />
//         {/* target range band */}
//         <path
//           d={`M ${bandStart.x} ${bandStart.y} A ${radius} ${radius} 0 ${bandLargeArc} 1 ${bandEnd.x} ${bandEnd.y}`}
//           fill="none"
//           stroke="var(--color-accent)"
//           strokeOpacity="0.35"
//           strokeWidth="10"
//           strokeLinecap="round"
//         />
//         {/* animated progress arc up to predicted value */}
//         <path
//           ref={arcRef}
//           d={`M ${polar(cx, cy, radius, START_ANGLE).x} ${polar(cx, cy, radius, START_ANGLE).y} A ${radius} ${radius} 0 1 1 ${
//             polar(cx, cy, radius, END_ANGLE).x
//           } ${polar(cx, cy, radius, END_ANGLE).y}`}
//           fill="none"
//           stroke="var(--color-accent)"
//           strokeWidth="3"
//           strokeLinecap="round"
//           strokeDasharray="700"
//           strokeDashoffset="700"
//         />
//         {/* ticks */}
//         {ticks.map((t, i) => (
//           <line
//             key={i}
//             x1={t.inner.x}
//             y1={t.inner.y}
//             x2={t.outer.x}
//             y2={t.outer.y}
//             stroke="var(--color-muted)"
//             strokeWidth={t.major ? 1.5 : 1}
//             opacity={t.major ? 0.55 : 0.3}
//           />
//         ))}
//         {/* needle */}
//         <g ref={needleRef} style={{ transformOrigin: `${cx}px ${cy}px` }}>
//           <line x1={cx} y1={cy} x2={cx} y2={cy - radius + 22} stroke="var(--color-ink)" strokeWidth="2.5" strokeLinecap="round" />
//           <circle cx={cx} cy={cy} r="5" fill="var(--color-ink)" />
//         </g>
//       </svg>

//       <div className="-mt-2 text-center">
//         <div className="font-mono text-[11px] tracking-wider text-[var(--color-muted)] uppercase">Estimated price</div>
//         <div className="font-display text-4xl font-semibold mt-1">
//           ₹<span ref={numberRef}>0</span>
//         </div>
//         {price != null && !loading && (
//           <div className="font-mono text-xs text-[var(--color-muted)] mt-1">
//             likely range ₹{Math.round(low).toLocaleString("en-IN")} – ₹{Math.round(high).toLocaleString("en-IN")}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }
import { useEffect, useMemo, useRef } from "react";
import gsap from "gsap";

// Gauge sweeps from -120deg to +120deg (240deg arc) across [min, max]
const START_ANGLE = -120;
const END_ANGLE = 120;

function angleForValue(value, min, max) {
  const clamped = Math.min(Math.max(value, min), max);
  const ratio = (clamped - min) / (max - min || 1);
  return START_ANGLE + ratio * (END_ANGLE - START_ANGLE);
}

function polar(cx, cy, r, angleDeg) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

// NEW: builds an arc path between two angles instead of always the full sweep
function arcPath(cx, cy, r, startAngle, endAngle) {
  const start = polar(cx, cy, r, startAngle);
  const end = polar(cx, cy, r, endAngle);
  const largeArc = Math.abs(endAngle - startAngle) > 180 ? 1 : 0;
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 1 ${end.x} ${end.y}`;
}

export default function PriceDial({ price, low, high, loading }) {
  const needleRef = useRef(null);
  const numberRef = useRef(null);
  const arcRef = useRef(null);

  const min = 0;
  const max = useMemo(() => Math.max(high * 1.15, 10000), [high]);

  const size = 260;
  const cx = size / 2;
  const cy = size / 2 + 10;
  const radius = 96;

  const ticks = useMemo(() => {
    const arr = [];
    const count = 12;
    for (let i = 0; i <= count; i++) {
      const angle = START_ANGLE + (i / count) * (END_ANGLE - START_ANGLE);
      const outer = polar(cx, cy, radius + 10, angle);
      const inner = polar(cx, cy, radius + (i % 3 === 0 ? 0 : 4), angle);
      arr.push({ outer, inner, major: i % 3 === 0 });
    }
    return arr;
  }, []);

  const bandStart = polar(cx, cy, radius, angleForValue(low, min, max));
  const bandEnd = polar(cx, cy, radius, angleForValue(high, min, max));
  const bandLargeArc = angleForValue(high, min, max) - angleForValue(low, min, max) > 180 ? 1 : 0;

  useEffect(() => {
    if (loading) {
      gsap.to(needleRef.current, {
        rotation: () => gsap.utils.random(-40, 40),
        duration: 0.4,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        transformOrigin: "50% 100%",
      });

      // Hide the progress arc entirely while loading instead of leaving
      // the previous (or default) full-sweep path visible.
      if (arcRef.current) {
        gsap.killTweensOf(arcRef.current);
        arcRef.current.setAttribute("d", arcPath(cx, cy, radius, START_ANGLE, START_ANGLE));
      }

      return () => gsap.killTweensOf(needleRef.current);
    }

    if (price == null) return;

    const targetAngle = angleForValue(price, min, max);
    const tl = gsap.timeline();
    tl.to(needleRef.current, {
      rotation: targetAngle,
      duration: 1.1,
      ease: "elastic.out(1, 0.65)",
      transformOrigin: "50% 100%",
    });

    const counter = { val: 0 };
    tl.to(
      counter,
      {
        val: price,
        duration: 1.0,
        ease: "power2.out",
        onUpdate: () => {
          if (numberRef.current) {
            numberRef.current.textContent = Math.round(counter.val).toLocaleString("en-IN");
          }
        },
      },
      "<"
    );

    // FIX: draw the arc only from START_ANGLE to the price's actual angle,
    // and derive dasharray/dashoffset from the real (dynamic) path length
    // instead of a hardcoded guess. Previously the path always spanned the
    // full START_ANGLE -> END_ANGLE sweep, and the hardcoded dasharray="700"
    // was longer than the true arc length (~402 at this radius), so once
    // the offset animation reached 0 the *entire* track rendered as "dash"
    // (visible) regardless of the price — making the whole dial look green
    // even for a low price like 3000.
    if (arcRef.current) {
      arcRef.current.setAttribute("d", arcPath(cx, cy, radius, START_ANGLE, targetAngle));
      const length = arcRef.current.getTotalLength();
      gsap.set(arcRef.current, { strokeDasharray: length, strokeDashoffset: length });
      gsap.to(arcRef.current, { strokeDashoffset: 0, duration: 1.3, ease: "power3.out" });
    }

    return () => tl.kill();
  }, [price, loading, min, max]);

  return (
    <div className="flex flex-col items-center select-none">
      <svg width={size} height={size / 2 + 60} viewBox={`0 0 ${size} ${size / 2 + 60}`} className="overflow-visible">
        {/* base track */}
        <path
          d={arcPath(cx, cy, radius, START_ANGLE, END_ANGLE)}
          fill="none"
          stroke="var(--color-line)"
          strokeWidth="10"
          strokeLinecap="round"
        />
        {/* target range band */}
        <path
          d={`M ${bandStart.x} ${bandStart.y} A ${radius} ${radius} 0 ${bandLargeArc} 1 ${bandEnd.x} ${bandEnd.y}`}
          fill="none"
          stroke="var(--color-accent)"
          strokeOpacity="0.35"
          strokeWidth="10"
          strokeLinecap="round"
        />
        {/* animated progress arc up to predicted value — d/dasharray/dashoffset
            are now set imperatively in the effect above based on the price */}
        <path
          ref={arcRef}
          d={arcPath(cx, cy, radius, START_ANGLE, START_ANGLE)}
          fill="none"
          stroke="var(--color-accent)"
          strokeWidth="3"
          strokeLinecap="round"
        />
        {/* ticks */}
        {ticks.map((t, i) => (
          <line
            key={i}
            x1={t.inner.x}
            y1={t.inner.y}
            x2={t.outer.x}
            y2={t.outer.y}
            stroke="var(--color-muted)"
            strokeWidth={t.major ? 1.5 : 1}
            opacity={t.major ? 0.55 : 0.3}
          />
        ))}
        {/* needle */}
        <g ref={needleRef} style={{ transformOrigin: `${cx}px ${cy}px` }}>
          <line x1={cx} y1={cy} x2={cx} y2={cy - radius + 22} stroke="var(--color-ink)" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx={cx} cy={cy} r="5" fill="var(--color-ink)" />
        </g>
      </svg>

      <div className="-mt-2 text-center">
        <div className="font-mono text-[11px] tracking-wider text-[var(--color-muted)] uppercase">Estimated price</div>
        <div className="font-display text-4xl font-semibold mt-1">
          ₹<span ref={numberRef}>0</span>
        </div>
        {price != null && !loading && (
          <div className="font-mono text-xs text-[var(--color-muted)] mt-1">
            likely range ₹{Math.round(low).toLocaleString("en-IN")} – ₹{Math.round(high).toLocaleString("en-IN")}
          </div>
        )}
      </div>
    </div>
  );
}