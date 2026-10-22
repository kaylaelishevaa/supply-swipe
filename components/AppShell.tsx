"use client";
// Phone-width shell. On a phone the app fills the screen (max 390px wide).
// On a laptop it sits in a centred 390×844 phone frame, scaled down to fit short windows.
// /demo and ?view=desktop render full width with no frame.

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";

export function AppShell({ children }: { children: ReactNode }) {
  const path = usePathname();
  const params = useSearchParams();
  const bare = path.startsWith("/demo") || params.get("view") === "desktop";
  const [mode, setMode] = useState<{ framed: boolean; scale: number }>({ framed: false, scale: 1 });

  useEffect(() => {
    const fit = () => {
      const framed = window.innerWidth >= 520;
      setMode({ framed, scale: framed ? Math.min(1, (window.innerHeight - 32) / 844) : 1 });
    };
    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, []);

  if (bare) return <>{children}</>;

  if (!mode.framed) {
    return <div className="mx-auto h-[100dvh] w-full max-w-[390px] overflow-hidden">{children}</div>;
  }

  return (
    <div className="flex min-h-screen items-center justify-center py-4">
      <div
        style={{ width: 390 + 20, height: 844 + 20, transform: `scale(${mode.scale})`, transformOrigin: "center" }}
        className="flex-none rounded-[54px] bg-ink p-[10px] shadow-hero"
      >
        <div className="relative h-[844px] w-[390px] overflow-hidden rounded-[44px] bg-bg">{children}</div>
      </div>
    </div>
  );
}
