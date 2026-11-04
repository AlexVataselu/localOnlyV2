import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Inter } from "next/font/google";
import StyledComponentsRegistry from "@/lib/styled-components-registry";
import { Providers } from "./providers";

// Inter was referenced in CSS but never loaded, so most visitors got a fallback font.
const inter = Inter({ subsets: ["latin", "latin-ext"], variable: "--font-inter", display: "swap" });

export const metadata: Metadata = {
  title: { default: "Locals Only", template: "%s · Locals Only" },
  description: "Discover unique local experiences hosted by the people who live there.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body>
        <StyledComponentsRegistry>
          <Providers>
            {children}
          </Providers>
        </StyledComponentsRegistry>
      </body>
    </html>
  );
}
