import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Inter, Mulish, Roboto } from "next/font/google";
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
    "Hikes, bike clinics, cooking classes and more, run by the people who live there. Browse and book local experiences across Romania.",
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} ${mulish.variable} ${roboto.variable}`}>
      <body>
        <StyledComponentsRegistry>
          <Providers>{children}</Providers>
        </StyledComponentsRegistry>
      </body>
    </html>
  );
}
