const STEPS = [
  {
    label: "Spec sheet in",
    text: "You provide the brand (optional), rating, RAM and storage — the same numbers on any phone's box.",
  },
  {
    label: "Model predicts the price",
    text: "A KNN machine-learning model trained on approximately 28,000 phone configurations, using around 8 neighbours, estimates a fair price for the phone.",
  },
  {
    label: "Live search",
    text: "The predicted budget is used to search the current market for phones actually worth comparing it to.",
  },
  {
    label: "Structured by AI",
    text: "Raw search results are distilled into five clean, comparable picks — name, price, specs, and why it fits.",
  },
];

export default function About() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-14">
      <h1 className="font-display text-3xl font-semibold tracking-tight mb-4">How this works</h1>
      <p className="text-[var(--color-muted)] leading-relaxed mb-10">
        PhonePredict turns your phone specifications into a price estimate, then grounds that
        estimate in what's actually available in the current market. Nothing here is a listing
        price — it's an estimate based on a machine-learning model trained on approximately
        28,000 phone configurations and followed by live market search.
      </p>

      <ol className="space-y-6">
        {STEPS.map((step, i) => (
          <li key={step.label} className="flex gap-4">
            <span className="font-mono text-xs text-[var(--color-accent)] pt-1 w-6 shrink-0">{String(i + 1).padStart(2, "0")}</span>
            <div>
              <h2 className="font-display font-semibold text-[15px]">{step.label}</h2>
              <p className="text-sm text-[var(--color-muted)] mt-1 leading-relaxed">{step.text}</p>
            </div>
          </li>
        ))}
      </ol>

      <div className="mt-10">
        <p className="font-mono text-[11px] uppercase tracking-wider text-[var(--color-muted)] mb-3">
          About the project
        </p>
        <p className="text-sm text-[var(--color-ink)]/80 leading-relaxed">
          PhonePredict is made by Rituraj. The price prediction model was trained on approximately
          28,000 phone records using KNN with around 8 neighbours.
        </p>

        <div className="mt-4 flex flex-wrap gap-4 text-sm">
          <a
            href="https://github.com/therituraj/Mobile-Price-Prediction-ML-Model"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--color-accent)] hover:underline"
          >
            ML Model
          </a>
          <a
            href="https://github.com/therituraj/Mobile-Price-Prediction-FullStack"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--color-accent)] hover:underline"
          >
            Project on GitHub
          </a>
          <a
            href="https://therituraj.in"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--color-accent)] hover:underline"
          >
            therituraj.in
          </a>
          <a
            href="mailto:hello@therituraj.in"
            className="text-[var(--color-accent)] hover:underline"
          >
            hello@therituraj.in
          </a>
        </div>
      </div>
    </div>
  );
}