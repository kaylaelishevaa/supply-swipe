// Root layout: fonts, the demo context (side and role) and the phone-width shell.

import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import { Suspense } from "react";
import { DemoProvider } from "@/lib/demo-context";
import { AppShell } from "@/components/AppShell";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], weight: ["400", "600", "800"], variable: "--font-jakarta" });
const mono = JetBrains_Mono({ subsets: ["latin"], weight: ["400", "600"], variable: "--font-mono" });

export const metadata: Metadata = {
  title: "SupplySwipe · Wakil negotiates, you approve",
  description: "An Orbyte module where two AI agents negotiate a weekly supply deal and both owners approve. Prototype with synthetic data.",
  icons: { icon: "/logos/supplyswipe-icon.png" },
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#EFEEF6" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${jakarta.variable} ${mono.variable}`}>
      <body className="font-sans">
        <DemoProvider>
          <Suspense>
            <AppShell>{children}</AppShell>
          </Suspense>
        </DemoProvider>
      </body>
    </html>
  );
}
