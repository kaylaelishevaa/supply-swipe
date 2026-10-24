"use client";
// /demo: guided 20-step wrapper for the video and the judges. Each step loads the REAL app route
// in a phone-sized frame, with the side and role it needs, plus a one-line caption.

/* eslint-disable @next/next/no-img-element */
import { useEffect, useState } from "react";
import type { Role, Side } from "@/lib/types";

type Step = { id: string; side: Side | "both"; title: string; hint: string; url: string; as: { side: Side; role: Role } };

const B = (role: Role = "owner") => ({ side: "buyer" as Side, role });
const S = (role: Role = "owner") => ({ side: "supplier" as Side, role });

const STEPS: Step[] = [
  { id: "S1", side: "buyer", title: "Mak Ngah joins from Orbyte", hint: "Her business profile is already filled in from Orbyte. She only checks it.", url: "/onboarding?prep=reset", as: B() },
  { id: "S2a", side: "buyer", title: "Meet and dress up the Wakil", hint: "Try it: drag the agent, change hat, face, colour. Open Personality and write anything that is not in the options.", url: "/onboarding/wakil", as: B() },
  { id: "S2", side: "buyer", title: "Set sealed limits once", hint: "Target is public. The RM12.50 maximum is sealed: only her Wakil ever sees it.", url: "/onboarding/limits", as: B() },
  { id: "B1", side: "buyer", title: "Aisyah posts this week's order", hint: "The kitchen lead posts 50 kg chicken breast, Mon and Thu. Or sends a voice note in BM.", url: "/requests/new", as: B("staff") },
  { id: "B2", side: "buyer", title: "Swipe right on a supplier", hint: "Try it: drag the card, tap Flip to see what the Wakil will do, swipe right to send it.", url: "/feed", as: B("staff") },
  { id: "S3", side: "buyer", title: "Two Wakils negotiate", hint: "Plays by itself. Every offer has a reason. No offer can go past either side's sealed limit. Tap Replay to watch again.", url: "/negotiation/n-0142", as: B() },
  { id: "N1", side: "buyer", title: "One notification for the owner", hint: "No chasing on WhatsApp. Mak Ngah gets one alert when a deal is ready.", url: "/notify", as: B() },
  { id: "S4", side: "buyer", title: "Mak Ngah approves", hint: "One teal button. She sees savings vs last week and vs market before tapping.", url: "/approve/SS-0142", as: B() },
  { id: "S4s", side: "buyer", title: "If staff try to approve", hint: "Try it: Aisyah can only approve up to RM500, so she asks the owner instead.", url: "/approve/SS-0142", as: B("staff") },
  { id: "S4b", side: "buyer", title: "Or counter via Wakil", hint: "Try it: type one line. The same Wakil picks up the chat for up to 4 more messages.", url: "/approve/SS-0142/counter", as: B() },
  { id: "P2", side: "supplier", title: "Supplier side: buyer requests", hint: "Ayam Segar sees buyer requests the same way. Same swipe, mirrored.", url: "/feed", as: S() },
  { id: "P3", side: "supplier", title: "Supplier owner approves too", hint: "Nothing is created until both owners approve. Small orders under the rep's limit are already handled.", url: "/approve/SS-0142", as: S() },
  { id: "S8", side: "both", title: "Deal sealed", hint: "Both approvals with names and times. Saved to Orbyte as a purchase order.", url: "/deal/SS-0142/sealed?prep=seal", as: B() },
  { id: "S5", side: "both", title: "Chat with pinned terms", hint: "They can chat, but messages never change the agreed terms.", url: "/deal/SS-0142?prep=seal", as: B() },
  { id: "I1", side: "buyer", title: "Invoice check", hint: "The first invoice is RM25 off the pinned terms. The Wakil catches it before anyone pays.", url: "/deal/SS-0142/invoice?prep=seal", as: B() },
  { id: "S6", side: "both", title: "Activity log", hint: "Try it: switch Owner / Staff. Every step is written down, including messages the rules blocked.", url: "/log?prep=seal", as: B() },
  { id: "B3", side: "buyer", title: "Week 3: price moved", hint: "Renegotiate with memory. The Wakil remembers 3 of 3 on-time drops and closes faster.", url: "/history/ayam-segar", as: B() },
  { id: "S7", side: "buyer", title: "When there is no deal", hint: "Floor above max ends straight away with 0 tokens used, shows the gap and who else fits.", url: "/no-deal/n-0139", as: B() },
  { id: "P1", side: "supplier", title: "Supplier listings", hint: "List price, MOQ, capacity, and a sealed floor per item.", url: "/listings", as: S() },
  { id: "S3D", side: "buyer", title: "Laptop view of the negotiation", hint: "The same negotiation on a big screen, for the pitch.", url: "/negotiation/n-0142?view=desktop", as: B() },
];

const TAG: Record<Step["side"], [string, string, string]> = {
  buyer: ["Buyer", "#E6E3FF", "#4A3DD6"],
  supplier: ["Supplier", "#D7F3EC", "#0B7563"],
  both: ["Both", "#E9E8F3", "#4E4C66"],
};
const KEY = "supplyswipe.prototype.step";

function SideTag({ side }: { side: Step["side"] }) {
  const [label, bg, fg] = TAG[side];
  return (
    <span className="flex h-5 items-center whitespace-nowrap rounded-full px-2 text-[10px] font-semibold" style={{ background: bg, color: fg }}>
      {label}
    </span>
  );
}

export default function DemoPage() {
  const [i, setI] = useState(0);
  const [src, setSrc] = useState<string | null>(null);
  const [vw, setVw] = useState(1400);
  const [vh, setVh] = useState(900);

  // Restore the last step and track the window size.
  useEffect(() => {
    try {
      const n = parseInt(localStorage.getItem(KEY) || "0", 10);
      if (n >= 0 && n < STEPS.length) setI(n);
    } catch {
      // ignore
    }
    const r = () => {
      setVw(window.innerWidth);
      setVh(window.innerHeight);
    };
    r();
    window.addEventListener("resize", r);
    return () => window.removeEventListener("resize", r);
  }, []);

  // Set the side and role the step needs, then load its route in the frame.
  useEffect(() => {
    const s = STEPS[i];
    try {
      localStorage.setItem("supplyswipe.demo", JSON.stringify(s.as));
      localStorage.setItem(KEY, String(i));
    } catch {
      // ignore
    }
    setSrc(s.url + (s.url.includes("?") ? "&" : "?") + "t=" + Date.now());
  }, [i]);

  const go = (n: number) => setI(Math.max(0, Math.min(STEPS.length - 1, n)));

  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && /INPUT|TEXTAREA/.test(t.tagName)) return;
      if (e.key === "ArrowRight") setI((x) => Math.min(STEPS.length - 1, x + 1));
      if (e.key === "ArrowLeft") setI((x) => Math.max(0, x - 1));
    };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, []);

  const step = STEPS[i];
  const desk = step.id === "S3D";
  const fw = desk ? 1280 : 390;
  const fh = desk ? 800 : 844;
  const wide = vw >= 860;
  const availW = Math.max(300, (wide ? vw - 340 - 40 - 48 : vw - 48) - 20);
  const availH = Math.max(420, vh - 230);
  const scale = Math.min(1, availW / fw, availH / fh);
  const last = i + 1 >= STEPS.length;

  return (
    <div className="flex min-h-screen flex-wrap items-start justify-center gap-10 bg-[#E3E2EC] px-6 py-7 text-ink">
      {wide && (
        <div className="sticky top-7 flex w-[340px] flex-none flex-col gap-[18px]">
          <img src="/logos/supplyswipe-lockup.png" alt="SupplySwipe" className="-ml-2.5 block h-auto w-[230px]" />
          <div className="text-[14px] leading-[1.55] text-[#4E4C66]">
            Two AI agents negotiate a weekly chicken deal for a PJ restaurant and its supplier. Owners only approve. Click through the story, and try the screens: swipe cards, customise the Wakil, switch roles.
          </div>
          <div className="flex max-h-[calc(100vh-300px)] flex-col overflow-y-auto rounded-[24px] bg-white p-2 shadow-card">
            {STEPS.map((s, j) => {
              const on = j === i;
              return (
                <button
                  key={s.id + j}
                  onClick={() => go(j)}
                  className="grid grid-cols-[26px_minmax(0,1fr)_auto] items-center gap-2.5 rounded-[16px] px-2.5 py-[9px] text-left"
                  style={{ background: on ? "#1D1B2E" : "transparent" }}
                >
                  <span className="font-mono text-[11px]" style={{ color: on ? "#B4B2C8" : "#6E6C86" }}>
                    {String(j + 1).padStart(2, "0")}
                  </span>
                  <span className="truncate text-[13px] font-semibold" style={{ color: on ? "#fff" : "#1D1B2E" }}>
                    {s.title}
                  </span>
                  <SideTag side={s.side} />
                </button>
              );
            })}
          </div>
          <div className="flex items-center gap-2 text-[11px] text-muted">
            <span className="rounded-md bg-white px-1.5 py-0.5 font-mono">←</span>
            <span className="rounded-md bg-white px-1.5 py-0.5 font-mono">→</span>
            keys also work
            <span className="flex-1" />
            <button onClick={() => (i === 0 ? setSrc(STEPS[0].url + "&t=" + Date.now()) : go(0))} className="font-semibold text-purple-text">
              Reset demo
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-none flex-col items-center gap-4">
        <div className="flex w-[420px] max-w-[calc(100vw-48px)] flex-col items-center gap-1 text-center">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[11px] text-muted">
              {String(i + 1).padStart(2, "0")} / {STEPS.length}
            </span>
            <SideTag side={step.side} />
          </div>
          <div className="max-w-full truncate text-[20px] font-extrabold leading-[1.25] tracking-[-0.02em]">{step.title}</div>
          <div className="text-pretty text-[13px] leading-[1.45] text-[#4E4C66]">{step.hint}</div>
        </div>

        <div className="relative flex-none" style={{ width: Math.round(fw * scale), height: Math.round(fh * scale) }}>
          <div
            className="absolute left-0 top-0 overflow-hidden bg-bg"
            style={{
              width: fw,
              height: fh,
              transform: `scale(${scale})`,
              transformOrigin: "0 0",
              borderRadius: desk ? 18 : 44,
              boxShadow: "0 30px 70px rgba(60,55,120,0.25), 0 0 0 10px #1D1B2E",
            }}
          >
            {src && <iframe key={src} src={src} title={step.title} className="block h-full w-full border-0" />}
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => go(i - 1)}
            className="flex h-12 items-center whitespace-nowrap rounded-full bg-white px-5 text-[14px] font-semibold shadow-ctl"
            style={{ opacity: i === 0 ? 0.4 : 1 }}
          >
            Back
          </button>
          <button onClick={() => (last ? go(0) : go(i + 1))} className="flex h-12 items-center gap-2 whitespace-nowrap rounded-full bg-ink px-[22px] text-[14px] font-semibold text-white shadow-ink">
            {last ? "Start again" : "Next: " + STEPS[i + 1].title}
          </button>
        </div>
        <div className="max-w-[420px] text-center text-[11px] text-muted">Prototype with demo data. Nothing is sent or paid. The 3D Wakils need an internet connection.</div>
      </div>
    </div>
  );
}
