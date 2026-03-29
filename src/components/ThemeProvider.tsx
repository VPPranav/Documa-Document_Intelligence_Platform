import { createContext, useContext, useEffect, useRef, useState } from "react";

type Theme = "dark" | "light" | "system";

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
};

type ThemeProviderState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: "dark" | "light";
};

const initialState: ThemeProviderState = {
  theme: "system",
  setTheme: () => null,
  resolvedTheme: "light",
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

// ---------------------------------------------------------------------------
// Gradient mesh background — pure CSS, theme-aware, barely visible
// ---------------------------------------------------------------------------
const STYLES = `
  @keyframes documa-drift-1 {
    0%, 100% { transform: translate(0%, 0%) scale(1); }
    33%       { transform: translate(8%, -6%) scale(1.08); }
    66%       { transform: translate(-5%, 9%) scale(0.95); }
  }
  @keyframes documa-drift-2 {
    0%, 100% { transform: translate(0%, 0%) scale(1); }
    33%       { transform: translate(-9%, 7%) scale(1.06); }
    66%       { transform: translate(6%, -8%) scale(0.97); }
  }
  @keyframes documa-drift-3 {
    0%, 100% { transform: translate(0%, 0%) scale(1); }
    50%       { transform: translate(5%, 5%) scale(1.05); }
  }

  .documa-bg {
    position: fixed;
    inset: 0;
    z-index: 0;
    pointer-events: none;
    overflow: hidden;
    transition: background 1.2s ease;
  }

  .documa-bg .orb {
    position: absolute;
    border-radius: 50%;
    filter: blur(72px);
    opacity: 0;
    transition: background 1.2s ease, opacity 1.2s ease;
  }

  /* Dark theme orbs */
  .dark .documa-bg { background: #030712; }
  .dark .documa-bg .orb-1 {
    width: 55vw; height: 55vw;
    top: -15%; left: -10%;
    background: radial-gradient(circle, rgba(99,102,241,0.18) 0%, transparent 70%);
    animation: documa-drift-1 18s ease-in-out infinite;
    opacity: 1;
  }
  .dark .documa-bg .orb-2 {
    width: 45vw; height: 45vw;
    bottom: -10%; right: -5%;
    background: radial-gradient(circle, rgba(56,189,248,0.13) 0%, transparent 70%);
    animation: documa-drift-2 22s ease-in-out infinite;
    opacity: 1;
  }
  .dark .documa-bg .orb-3 {
    width: 35vw; height: 35vw;
    top: 40%; left: 40%;
    background: radial-gradient(circle, rgba(139,92,246,0.10) 0%, transparent 70%);
    animation: documa-drift-3 26s ease-in-out infinite;
    opacity: 1;
  }

  /* Light theme orbs */
  .light .documa-bg { background: #f9fafb; }
  .light .documa-bg .orb-1 {
    width: 55vw; height: 55vw;
    top: -15%; left: -10%;
    background: radial-gradient(circle, rgba(99,102,241,0.10) 0%, transparent 70%);
    animation: documa-drift-1 18s ease-in-out infinite;
    opacity: 1;
  }
  .light .documa-bg .orb-2 {
    width: 45vw; height: 45vw;
    bottom: -10%; right: -5%;
    background: radial-gradient(circle, rgba(56,189,248,0.08) 0%, transparent 70%);
    animation: documa-drift-2 22s ease-in-out infinite;
    opacity: 1;
  }
  .light .documa-bg .orb-3 {
    width: 35vw; height: 35vw;
    top: 40%; left: 40%;
    background: radial-gradient(circle, rgba(139,92,246,0.06) 0%, transparent 70%);
    animation: documa-drift-3 26s ease-in-out infinite;
    opacity: 1;
  }
`;

function ThemeBackground() {
  const styleRef = useRef<HTMLStyleElement | null>(null);

  useEffect(() => {
    if (!styleRef.current) {
      const el = document.createElement("style");
      el.textContent = STYLES;
      document.head.appendChild(el);
      styleRef.current = el;
    }
    return () => {
      styleRef.current?.remove();
      styleRef.current = null;
    };
  }, []);

  return (
    <div className="documa-bg" aria-hidden="true">
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />
    </div>
  );
}

// ---------------------------------------------------------------------------
// ThemeProvider — all original logic preserved
// ---------------------------------------------------------------------------
export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "documa-ui-theme",
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem(storageKey) as Theme) || defaultTheme
  );
  const [resolvedTheme, setResolvedTheme] = useState<"dark" | "light">("light");

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");

    let resolved: "dark" | "light";

    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
      resolved = systemTheme;
    } else {
      resolved = theme;
    }

    root.classList.add(resolved);
    setResolvedTheme(resolved);
  }, [theme]);

  useEffect(() => {
    if (theme !== "system") return;
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      const root = window.document.documentElement;
      root.classList.remove("light", "dark");
      const resolved = mediaQuery.matches ? "dark" : "light";
      root.classList.add(resolved);
      setResolvedTheme(resolved);
    };
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [theme]);

  const value = {
    theme,
    resolvedTheme,
    setTheme: (theme: Theme) => {
      localStorage.setItem(storageKey, theme);
      setTheme(theme);
    },
  };

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      <ThemeBackground />
      <div style={{ position: "relative", zIndex: 1 }}>
        {children}
      </div>
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);
  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider");
  return context;
};