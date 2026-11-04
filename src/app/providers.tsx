"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SessionProvider } from "next-auth/react";
import {
  type PropsWithChildren,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { ThemeProvider } from "styled-components";
import { GlobalStyle } from "@/styles/globalStyles";
import { darkTheme, lightTheme } from "@/styles/theme";

type ThemeMode = "light" | "dark";

interface ThemeContextValue {
  themeMode: ThemeMode;
  toggleTheme: () => void;
}

const ThemeModeContext = createContext<ThemeContextValue | undefined>(undefined);
const STORAGE_KEY = "theme-mode";

export function useThemeMode() {
  const context = useContext(ThemeModeContext);
  if (!context) {
    throw new Error("useThemeMode must be used within the Providers component");
  }
  return context;
}

function readStoredTheme(): ThemeMode | null {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored === "light" || stored === "dark" ? stored : null;
  } catch {
    return null;
  }
}

export function Providers({ children }: PropsWithChildren) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
            staleTime: 60 * 1000,
            retry: 1,
          },
        },
      }),
  );
  const [themeMode, setThemeMode] = useState<ThemeMode>("dark");

  useEffect(() => {
    const stored = readStoredTheme();
    // Sync with the persisted preference once on mount (localStorage is unavailable during SSR).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (stored) setThemeMode(stored);
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = themeMode;
    document.documentElement.style.colorScheme = themeMode;
  }, [themeMode]);

  const toggleTheme = useCallback(() => {
    setThemeMode((current) => {
      const next = current === "light" ? "dark" : "light";
      try {
        window.localStorage.setItem(STORAGE_KEY, next);
      } catch {
        // Storage can be blocked (private mode); the toggle still works for this visit.
      }
      return next;
    });
  }, []);

  const theme = themeMode === "light" ? lightTheme : darkTheme;
  const contextValue = useMemo(() => ({ themeMode, toggleTheme }), [themeMode, toggleTheme]);

  return (
    <SessionProvider>
      <QueryClientProvider client={queryClient}>
        <ThemeModeContext.Provider value={contextValue}>
          <ThemeProvider theme={theme}>
            <GlobalStyle />
            {children}
          </ThemeProvider>
        </ThemeModeContext.Provider>
      </QueryClientProvider>
    </SessionProvider>
  );
}
