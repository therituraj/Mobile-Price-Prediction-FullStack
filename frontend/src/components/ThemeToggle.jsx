import { useTheme } from "../theme/ThemeContext";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      aria-pressed={isDark}
      className="relative h-8 w-14 rounded-full border border-[var(--color-line)] bg-[var(--color-surface)] transition-colors duration-300 cursor-pointer"
    >
      <span
        className="absolute top-0.5 h-6 w-6 rounded-full bg-[var(--color-accent)] transition-transform duration-300 ease-out flex items-center justify-center text-[10px]"
        style={{ transform: isDark ? "translateX(26px)" : "translateX(2px)" }}
      >
        {isDark ? "☾" : "☀"}
      </span>
    </button>
  );
}
