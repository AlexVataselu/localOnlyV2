import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Inter, Mulish, Roboto } from "next/font/google";
import Splash from "@/components/ui/Splash";
import { SPLASH_KEY } from "@/lib/splash";
import StyledComponentsRegistry from "@/lib/styled-components-registry";
import { Providers } from "./providers";

const inter = Inter({ subsets: ["latin", "latin-ext"], variable: "--font-body", display: "swap" });
const mulish = Mulish({
  subsets: ["latin", "latin-ext"],
  weight: ["700", "900"],
  variable: "--font-display",
  display: "swap",
});
const roboto = Roboto({ subsets: ["latin", "latin-ext"], weight: ["900"], variable: "--font-hero", display: "swap" });

export const metadata: Metadata = {
  title: { default: "Locals Only: experiences hosted by Romanian locals", template: "%s · Locals Only" },
  description:
    "Hikes, bike clinics, cooking classes and more, run by the people who live there. Discover local experiences across Romania.",
};

/** Runs before first paint: skip the splash after the first visit of a session. */
const splashGate = `try{if(sessionStorage.getItem(${JSON.stringify(SPLASH_KEY)})==="1")document.documentElement.dataset.splash="off"}catch(e){}`;

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} ${mulish.variable} ${roboto.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: splashGate }} />
      </head>
      <body>
        <StyledComponentsRegistry>
          <Providers>
            <Splash />
            {children}
          </Providers>
        </StyledComponentsRegistry>
      </body>
    </html>
  );
}
