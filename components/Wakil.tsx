"use client";
// The Wakil slot every screen uses. Renders the 3D <wakil-agent> when WebGL and three.js load,
// and the 2D WakilAvatar otherwise. Swapping the agent implementation only touches this file.

import { WakilAvatar, type WakilPose } from "./WakilAvatar";
import type { Side } from "@/lib/types";

export function Wakil(props: {
  side: Side;
  width: number;
  height: number;
  pose?: WakilPose;
  turn?: number;
  bust?: boolean;
  interactive?: boolean;
  className?: string;
  style?: React.CSSProperties;
}) {
  return <WakilAvatar side={props.side} width={props.width} height={props.height} pose={props.pose} className={props.className} style={props.style} />;
}
