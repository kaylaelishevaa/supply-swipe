import type { Config } from "tailwindcss";

// Design tokens from the handoff README ("2c Soft toy"). Colour means state, never decoration.
const config: Config = {
  content: ["./src/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#EFEEF6",
        card: "#FFFFFF",
        ink: "#1D1B2E",
        muted: "#6E6C86",
        line: "#E4E2EF",
        neutral: "#E9E8F3",
        disabled: "#8D8BA3",
        teal: { DEFAULT: "#0E8A76", text: "#0B7563", soft: "#D7F3EC" },
        purple: { DEFAULT: "#6A5CF0", text: "#4A3DD6", soft: "#E6E3FF" },
        coral: { DEFAULT: "#E8664A", text: "#C24A30", soft: "#FCE0D8" },
        amber: { DEFAULT: "#E9A23B", text: "#A86A12", soft: "#FCEBCB" },
        overlay: "rgba(29,27,46,0.42)",
      },
      borderRadius: { card: "22px", hero: "28px", sheet: "32px", field: "18px" },
      boxShadow: {
        card: "0 10px 28px rgba(60,55,120,0.10)",
        hero: "0 18px 40px rgba(60,55,120,0.12)",
        ctl: "0 6px 14px rgba(60,55,120,0.10)",
        field: "0 4px 12px rgba(60,55,120,0.06)",
        bubble: "0 4px 12px rgba(60,55,120,0.08)",
        approve: "inset 0 -4px 0 rgba(0,0,0,.18), 0 10px 20px rgba(14,138,118,.28)",
        ink: "inset 0 -3px 0 rgba(255,255,255,.08)",
        wakil: "inset 0 -3px 0 rgba(74,61,214,.15)",
      },
      fontFamily: {
        sans: ["var(--font-jakarta)", '"Plus Jakarta Sans"', "sans-serif"],
        mono: ["var(--font-mono)", '"JetBrains Mono"', "monospace"],
      },
      keyframes: {
        dotblink: { "0%,100%": { opacity: ".25" }, "50%": { opacity: "1" } },
        fadein: { from: { opacity: "0" }, to: { opacity: "1" } },
      },
      animation: {
        dotblink: "dotblink 1s ease-in-out infinite",
        fadein: "fadein .3s ease-out both",
      },
    },
  },
  plugins: [],
};
export default config;
