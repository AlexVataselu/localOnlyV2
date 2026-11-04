"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SessionProvider } from "next-auth/react";
import {
  PropsWithChildren,
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

export function useThemeMode() {
  const context = useContext(ThemeModeContext);

  if (!context) {
    throw new Error("useThemeMode must be used within the Providers component");
  }

  return context;
}

export function Providers({ children }: PropsWithChildren) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
            refetchOnMount: false,
            staleTime: 5 * 60 * 1000, // 5 minutes
          },
        },
      })
  );
  const [themeMode, setThemeMode] = useState<ThemeMode>("dark");

  useEffect(() => {
    const storedTheme = window.localStorage.getItem("theme-mode");

    if (storedTheme === "light" || storedTheme === "dark") {
      // Reads localStorage after mount: unavailable during server render.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setThemeMode(storedTheme);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem("theme-mode", themeMode);
    document.documentElement.dataset.theme = themeMode;
  }, [themeMode]);

  const toggleTheme = useCallback(() => {
    setThemeMode((current) => (current === "light" ? "dark" : "light"));
  }, []);

  const theme = useMemo(() => (themeMode === "light" ? lightTheme : darkTheme), [themeMode]);

  const contextValue = useMemo(
    () => ({
      themeMode,
      toggleTheme,
    }),
    [themeMode, toggleTheme],
  );

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

