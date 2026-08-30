export default function PhoneCard({ phone, index }) {
  return (
    <li
      data-card
      className="flex items-start gap-4 rounded-xl border border-[var(--color-line)] bg-[var(--color-surface)] p-4 transition-colors hover:border-[var(--color-accent)]/50"
    >
      <span className="font-mono text-xs text-[var(--color-muted)] pt-1 w-5 shrink-0">{String(index + 1).padStart(2, "0")}</span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
          <h3 className="font-display font-semibold text-[15px] truncate">
            {phone.name}
            {phone.company ? <span className="text-[var(--color-muted)] font-normal"> · {phone.company}</span> : null}
          </h3>
          {phone.price && <span className="font-mono text-sm shrink-0">{phone.price}</span>}
        </div>
        {phone.specs && <p className="font-mono text-xs text-[var(--color-muted)] mt-1">{phone.specs}</p>}
        {phone.reason && <p className="text-sm text-[var(--color-ink)]/80 mt-1.5 leading-snug">{phone.reason}</p>}
        {phone.source_url && (
          <a
            href={phone.source_url}
            target="_blank"
            rel="noreferrer"
            className="inline-block mt-1.5 text-xs text-[var(--color-accent)] hover:underline"
          >
            View source ↗
          </a>
        )}
      </div>
    </li>
  );
}
