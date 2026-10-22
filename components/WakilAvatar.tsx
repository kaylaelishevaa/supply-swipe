// 2D Wakil: the business logo in a purple (buyer) or teal (supplier) circle.
// Same slot sizes as the 3D agent. It is also the fallback when WebGL or the CDN is unavailable.

/* eslint-disable @next/next/no-img-element */
import type { Side } from "@/lib/types";
import { LOGO } from "@/lib/mock";

export type WakilPose = "idle" | "speak" | "think" | "happy";

export function WakilAvatar({
  side,
  width,
  height,
  pose = "idle",
  className = "",
  style,
}: {
  side: Side;
  width: number;
  height: number;
  pose?: WakilPose;
  className?: string;
  style?: React.CSSProperties;
}) {
  const d = Math.round(Math.min(width, height) * 0.78);
  const ring = side === "buyer" ? "#6A5CF0" : "#0E8A76";
  const soft = side === "buyer" ? "#E6E3FF" : "#D7F3EC";
  const logo = side === "buyer" ? LOGO.makNgah : LOGO.ayamSegar;
  const anim = pose === "speak" ? "animate-pulse" : pose === "happy" ? "animate-bounce" : "";
  return (
    <div className={`relative flex flex-none items-end justify-center ${className}`} style={{ width, height, ...style }}>
      <div
        className={`flex items-center justify-center rounded-full ${anim}`}
        style={{ width: d, height: d, background: soft, boxShadow: `inset 0 0 0 ${Math.max(2, d / 18)}px ${ring}`, marginBottom: Math.round(height * 0.04) }}
      >
        <img src={logo} alt="" draggable={false} style={{ width: d * 0.72, height: d * 0.72, objectFit: "contain" }} />
      </div>
    </div>
  );
}
