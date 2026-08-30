import { NavLink } from "react-router-dom";
import ThemeToggle from "./ThemeToggle";

const linkClass = ({ isActive }) =>
  `font-mono text-[13px] tracking-wide uppercase transition-colors ${
    isActive ? "text-[var(--color-ink)]" : "text-[var(--color-muted)] hover:text-[var(--color-ink)]"
  }`;

export default function Navbar() {
  return (
    <header className="border-b border-[var(--color-line)]">
      <div className="mx-auto max-w-5xl px-6 h-16 flex items-center justify-between">
        <NavLink to="/" className="flex items-center gap-2 group">
          <span className="h-2.5 w-2.5 rounded-full bg-[var(--color-accent)] transition-transform group-hover:scale-125" />
          <span className="font-display text-lg font-semibold tracking-tight">Phone
            <span className="text-accent">Predict</span>
          </span>
        </NavLink>

        <nav className="flex items-center gap-6">
          <NavLink to="/" end className={linkClass}>
            Predict
          </NavLink>
          <NavLink to="/history" className={linkClass}>
            History
          </NavLink>
          <NavLink to="/about" className={linkClass}>
            About
          </NavLink>
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
