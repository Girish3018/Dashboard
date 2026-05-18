
import { Moon, SunMedium } from "lucide-react";

export default function Navbar({ theme, onToggleTheme }) {
  return (
    <header className="h-16 border-b border-theme-border theme-surface-alpha backdrop-blur-md flex items-center justify-between px-6 sticky top-0 z-20 transition-theme">
      <div className="flex items-center gap-3">
        <h2 className="text-lg font-semibold tracking-wide theme-text">
          <span className="text-blue-600 dark:text-blue-400 font-bold">SOC</span> Secret Detection Platform
        </h2>
      </div>

      <button
        type="button"
        onClick={onToggleTheme}
        className="inline-flex items-center gap-2 rounded-full border border-theme-border bg-theme-card px-4 py-2 text-sm font-medium theme-text transition-theme hover:bg-theme-surface-strong"
        aria-label="Toggle theme"
      >
        {theme === "dark" ? <SunMedium size={18} /> : <Moon size={18} />}
        <span>{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>
      </button>
    </header>
  );
}
