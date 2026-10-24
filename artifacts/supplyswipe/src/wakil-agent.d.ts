import type { DetailedHTMLProps, HTMLAttributes } from "react";

type WakilAgentAttrs = DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement> & {
  saved?: "buyer" | "supplier";
  color?: string;
  hat?: string;
  face?: string;
  logo?: string;
  pose?: string;
  turn?: string | number;
  bust?: string;
  spin?: string;
  interactive?: string;
};

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "wakil-agent": WakilAgentAttrs;
    }
  }
}

declare global {
  interface Window {
    WakilAgent?: {
      get: (side: "buyer" | "supplier") => { color: string; hat: string; face: string };
      set: (side: "buyer" | "supplier", cfg: Record<string, unknown>) => void;
      reset: (side: "buyer" | "supplier") => void;
    };
  }
}
