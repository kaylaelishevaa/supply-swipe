"use client";
// The Wakil slot every screen uses. Shows the 2D WakilAvatar at once, then swaps in the 3D
// <wakil-agent> (public/wakil-agent.js, three.js from a CDN) when it has actually built its scene.
// No WebGL, a blocked CDN or a slow load all leave the 2D avatar in place, so every screen still works.

import { useEffect, useRef, useState } from "react";
import { WakilAvatar, type WakilPose } from "./WakilAvatar";
import type { Side } from "@/lib/types";

const DEFAULTS = {
  buyer: { color: "purple", hat: "chef", face: "happy", logo: "/logos/mak-ngah.png" },
  supplier: { color: "teal", hat: "cap", face: "focus", logo: "/logos/ayam-segar.png" },
};

let webgl: boolean | null = null;
function hasWebGL() {
  if (webgl !== null) return webgl;
  try {
    const c = document.createElement("canvas");
    webgl = !!(window.WebGLRenderingContext && (c.getContext("webgl") || c.getContext("experimental-webgl")));
  } catch {
    webgl = false;
  }
  return webgl;
}

export function Wakil({
  side,
  width,
  height,
  pose = "idle",
  turn = 0,
  bust = false,
  interactive = false,
  spin = false,
  look,
  logo,
  className = "",
  style,
}: {
  side: Side;
  width: number;
  height: number;
  pose?: WakilPose;
  turn?: number;
  bust?: boolean;
  interactive?: boolean;
  spin?: boolean;
  /** Live look for the S2a preview. Without it the agent reads the saved look for its side. */
  look?: { color: string; hat: string; face: string };
  /** Business logo on the agent's chest; defaults to the demo's own business on that side. */
  logo?: string;
  className?: string;
  style?: React.CSSProperties;
}) {
  const ref = useRef<HTMLElement>(null);
  const [mode, setMode] = useState<"2d" | "trying" | "3d">("2d");

  useEffect(() => {
    if (!hasWebGL()) return;
    setMode("trying");
  }, []);

  // Poll until the element has built its three.js scene (_b), or give up after 8s.
  useEffect(() => {
    if (mode !== "trying") return;
    const start = Date.now();
    const t = setInterval(() => {
      const el = ref.current as (HTMLElement & { _b?: unknown }) | null;
      if (el && el._b) {
        clearInterval(t);
        setMode("3d");
      } else if (Date.now() - start > 8000) {
        clearInterval(t);
        setMode("2d");
      }
    }, 200);
    return () => clearInterval(t);
  }, [mode]);

  const d = DEFAULTS[side];
  return (
    <div className={`relative flex-none ${className}`} style={{ width, height, ...style }}>
      {mode !== "3d" && <WakilAvatar side={side} width={width} height={height} pose={pose} logo={logo} className="absolute inset-0" />}
      {mode !== "2d" && (
        <wakil-agent
          ref={ref}
          {...(look ? {} : { saved: side })}
          color={look?.color ?? d.color}
          hat={look?.hat ?? d.hat}
          face={look?.face ?? d.face}
          logo={logo ?? d.logo}
          pose={pose}
          turn={String(turn)}
          {...(bust ? { bust: "" } : {})}
          {...(interactive ? { interactive: "" } : {})}
          {...(spin ? { spin: "" } : {})}
          style={{ position: "absolute", inset: 0, opacity: mode === "3d" ? 1 : 0 }}
        />
      )}
    </div>
  );
}
