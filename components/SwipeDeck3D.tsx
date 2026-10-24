"use client";
// 3D swipe deck for B2 (buyer sees suppliers) and P2 (supplier sees buyer requests).
// Drag or tap the buttons: right = send Wakil (starts a negotiation), left = skip. Flip shows what the Wakil will do.

/* eslint-disable @next/next/no-img-element */
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import * as api from "@/lib/api";
import { MAX_MESSAGES } from "@/lib/mock";
import type { Counterpart, Side } from "@/lib/types";
import { Chip } from "./Chip";
import { FitTiles } from "./FitTiles";
import { LockIcon } from "./Icons";
import { Wakil } from "./Wakil";
import { SwipeActions } from "./SwipeActions";
import { MatchOverlay } from "./MatchOverlay";

const THRESHOLD = 110;
const RING = 163.4; // circumference of the r=26 fit ring

interface DeckState {
  i: number; // index of the top card
  dx: number;
  dy: number;
  drag: boolean;
  snap: boolean; // true for one frame after a card returns to the back, so it jumps without animating
  out: number | null; // index of the card currently flying out
  flip: boolean;
}

export function SwipeDeck3D({ side, cards, ownLimit }: { side: Side; cards: Counterpart[]; ownLimit: number }) {
  const router = useRouter();
  const n = cards.length;
  const [s, setS] = useState<DeckState>({ i: 0, dx: 0, dy: 0, drag: false, snap: false, out: null, flip: false });
  const [match, setMatch] = useState<{ name: string; logo: string; href: string } | null>(null);
  const start = useRef<{ x: number; y: number } | null>(null);
  const lastDx = useRef(0); // latest drag offset, read on release (state may not have re-rendered yet)
  const flying = useRef(false);

  const ownLogo = side === "buyer" ? "/logos/mak-ngah.png" : "/logos/ayam-segar.png";
  const ownWakil = side === "buyer" ? "Wakil Mak Ngah" : "Wakil Ayam Segar";

  // Fly the top card out: dir 1 = nego (right), -1 = skip (left).
  function fly(dir: 1 | -1) {
    if (flying.current || n === 0) return;
    flying.current = true;
    const j = s.i;
    const card = cards[j];
    setS((p) => ({ ...p, out: j, dx: dir * 560, dy: p.dy + 40, drag: false, flip: false }));
    const call = dir > 0 ? api.startNegotiation(side, card.id) : api.skipCard(side, card.id).then(() => null);
    setTimeout(async () => {
      setS((p) => ({ ...p, i: (j + 1) % n, out: null, dx: 0, dy: 0, snap: true }));
      setTimeout(() => setS((p) => ({ ...p, snap: false })), 60);
      flying.current = false;
      const res = await call;
      if (res) setMatch({ name: card.name, logo: card.logo, href: res.noDeal ? `/no-deal/${res.id}` : `/negotiation/${res.id}` });
    }, 340);
  }

  function down(e: React.PointerEvent) {
    if (flying.current) return;
    start.current = { x: e.clientX, y: e.clientY };
    lastDx.current = 0;
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // ignore
    }
    setS((p) => ({ ...p, drag: true }));
  }
  function move(e: React.PointerEvent) {
    if (!start.current) return;
    const st = start.current;
    lastDx.current = e.clientX - st.x;
    setS((p) => ({ ...p, dx: e.clientX - st.x, dy: (e.clientY - st.y) * 0.6 }));
  }
  function up(e: React.PointerEvent) {
    if (!start.current) return;
    const dx = e.clientX - start.current.x || lastDx.current;
    start.current = null;
    if (Math.abs(dx) > THRESHOLD) fly(dx > 0 ? 1 : -1);
    else setS((p) => ({ ...p, drag: false, dx: 0, dy: 0 }));
  }

  const progress = Math.min(Math.abs(s.dx) / 120, 1);

  return (
    <>
      <div className="relative mx-[18px] flex-1" style={{ perspective: 1100, perspectiveOrigin: "50% 30%" }}>
        <div className="absolute bottom-[-6px] left-[10%] right-[10%] h-[30px] rounded-[50%] bg-[rgba(60,55,120,0.18)] blur-[12px]" />
        {cards.map((c, j) => {
          const k = (j - s.i + n) % n;
          const top = k === 0;
          let tf: string;
          let z = n - k;
          if (top) {
            const ry = Math.max(-40, Math.min(40, s.dx / 8));
            tf = `translate3d(${s.dx}px,${s.dy}px,0) rotateY(${ry}deg) rotateX(${-s.dy / 12 + 3}deg) rotateZ(${s.dx / 40}deg)`;
            if (s.out === j) z = n + 1;
          } else {
            const t = k - progress;
            tf = `translate3d(0,${t * 20}px,${-t * 90}px) rotateX(${3 + t * 4}deg)`;
          }
          const tr = s.snap || s.drag ? "none" : s.out === j ? "transform .34s ease-in" : "transform .45s cubic-bezier(.2,.9,.25,1.15)";
          const nego = top ? Math.max(0, Math.min(1, s.dx / THRESHOLD)) : 0;
          const skip = top ? Math.max(0, Math.min(1, -s.dx / THRESHOLD)) : 0;
          const num = String(j + 1).padStart(2, "0");
          const of = String(n).padStart(2, "0");

          return (
            <div
              key={c.id}
              onPointerDown={top ? down : undefined}
              onPointerMove={top ? move : undefined}
              onPointerUp={top ? up : undefined}
              onPointerCancel={top ? up : undefined}
              className="absolute inset-x-0 bottom-4 top-0 select-none"
              style={{
                transformStyle: "preserve-3d",
                touchAction: "none",
                cursor: top ? (s.drag ? "grabbing" : "grab") : "default",
                zIndex: z,
                transform: tf,
                transition: tr,
              }}
              aria-hidden={!top}
            >
              <div
                className="absolute inset-0"
                style={{
                  transformStyle: "preserve-3d",
                  transform: top && s.flip ? "rotateY(180deg)" : "rotateY(0deg)",
                  transition: "transform .6s cubic-bezier(.3,1.2,.4,1)",
                }}
              >
                {/* Front */}
                <div
                  className="absolute inset-0 flex flex-col rounded-[24px] border border-line bg-white shadow-[0_18px_40px_rgba(60,55,120,0.16)]"
                  style={{ transformStyle: "preserve-3d", backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden" }}
                >
                  <div className="relative h-[200px] flex-none rounded-t-[23px]" style={{ background: c.panel, transformStyle: "preserve-3d" }}>
                    <div className="absolute left-[18px] top-[18px] font-mono text-[11px] font-semibold" style={{ color: c.accent }}>
                      {num} / {of}
                    </div>
                    <img
                      src={c.logo}
                      alt={c.name}
                      draggable={false}
                      className="absolute left-1/2 top-[30px] -ml-[68px] h-[136px] w-[136px] object-contain"
                      style={{ transform: "translateZ(46px) rotate(-6deg)", filter: "drop-shadow(0 18px 18px rgba(60,55,120,0.25))" }}
                    />
                    <div className="absolute right-4 top-4 h-16 w-16" style={{ transform: "translateZ(70px)" }}>
                      <svg width="64" height="64" viewBox="0 0 64 64" aria-label={`${c.fit}% fit`}>
                        <circle cx="32" cy="32" r="26" fill="#fff" stroke="#E4E2EF" strokeWidth="6" />
                        <circle
                          cx="32"
                          cy="32"
                          r="26"
                          fill="none"
                          stroke="#0E8A76"
                          strokeWidth="6"
                          strokeLinecap="round"
                          strokeDasharray={`${((c.fit / 100) * RING).toFixed(1)} ${RING}`}
                          transform="rotate(-90 32 32)"
                        />
                        <text x="32" y="36" textAnchor="middle" fontSize="14" fontWeight="600" fill="#1D1B2E" fontFamily="var(--font-jakarta), Plus Jakarta Sans">
                          {c.fit}
                        </text>
                      </svg>
                    </div>
                    <div
                      className="absolute bottom-3.5 left-[18px] flex h-6 items-center whitespace-nowrap rounded-full bg-white px-2.5 text-[11px] font-semibold shadow-[0_6px_14px_rgba(60,55,120,0.12)]"
                      style={{ transform: "translateZ(30px)" }}
                    >
                      {c.listLabel}
                    </div>
                  </div>
                  <div className="flex flex-1 flex-col gap-3 px-[18px] pb-[18px] pt-4" style={{ transformStyle: "preserve-3d" }}>
                    <div style={{ transform: "translateZ(20px)" }}>
                      <div className="text-[21px] font-semibold tracking-[-0.01em]">{c.name}</div>
                      <div className="mt-0.5 text-[12px] text-muted">{c.location}</div>
                    </div>
                    <div className="flex flex-wrap gap-1.5" style={{ transform: "translateZ(12px)" }}>
                      {c.chips.map((ch) => (
                        <Chip key={ch.label} tone={ch.tone}>
                          {ch.label}
                        </Chip>
                      ))}
                    </div>
                    <div className="flex-1" />
                    <FitTiles tiles={c.tiles} />
                  </div>
                  <div
                    className="pointer-events-none absolute left-5 top-14 rounded-[10px] border-4 border-purple bg-white px-3 py-0.5 text-[30px] font-semibold tracking-[0.06em] text-purple-text"
                    style={{ transform: "translateZ(90px) rotate(-12deg)", opacity: nego }}
                  >
                    NEGO
                  </div>
                  <div
                    className="pointer-events-none absolute right-5 top-14 rounded-[10px] border-4 border-coral bg-white px-3 py-0.5 text-[30px] font-semibold tracking-[0.06em] text-coral-text"
                    style={{ transform: "translateZ(90px) rotate(12deg)", opacity: skip }}
                  >
                    SKIP
                  </div>
                </div>

                {/* Back: what the viewer's own Wakil will do. Shows only the viewer's own sealed limit. */}
                <div
                  className="absolute inset-0 flex flex-col gap-3.5 rounded-[24px] border border-line bg-white px-[18px] py-5 shadow-[0_18px_40px_rgba(60,55,120,0.16)]"
                  style={{ transform: "rotateY(180deg)", backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden" }}
                >
                  <div className="flex items-center gap-2.5">
                    <Wakil side={side} width={50} height={54} pose="idle" turn={-20} bust style={{ margin: "-8px -4px" }} />
                    <div>
                      <div className="text-[15px] font-semibold">If you send {ownWakil}</div>
                      <div className="text-[11px] text-muted">to {c.name}</div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2.5 rounded-[14px] bg-purple-soft p-3.5">
                    <div className="flex justify-between text-[13px]">
                      <span>Opens at</span>
                      <span className="font-semibold">{c.opensAt}/kg</span>
                    </div>
                    <div className="flex justify-between text-[13px]">
                      <span className="flex items-center gap-[5px] font-semibold text-purple-text">
                        <LockIcon />
                        {side === "buyer" ? "Never above" : "Never below · floor"}
                      </span>
                      <span className="font-semibold text-purple-text">RM{ownLimit.toFixed(2)}/kg</span>
                    </div>
                    <div className="text-[11px] text-purple-text">
                      Only your Wakil sees this. It never reaches the {side === "buyer" ? "supplier" : "buyer"}.
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 text-[13px] leading-[1.45]">
                    {[
                      side === "buyer" ? "Asks for Mon and Thu before 9am, 7-day terms" : "Offers your PJ route days, RM10 delivery below 40 kg",
                      `Stops at ${MAX_MESSAGES} messages or at your limit`,
                      "Sends you the deal. Nothing is created until you tap Approve.",
                    ].map((t, x) => (
                      <div key={x} className="flex gap-2.5">
                        <span className="pt-0.5 font-mono text-[11px] text-muted">0{x + 1}</span>
                        <span>{t}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex-1" />
                  <div className="border-t border-line pt-2.5 text-[11px] text-muted">Why this match: {c.why}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <SwipeActions
        ownLogo={ownLogo}
        onUndo={() => {
          if (!flying.current) setS((p) => ({ ...p, i: (p.i + n - 1) % n, flip: false }));
        }}
        onSkip={() => fly(-1)}
        onFlip={() => setS((p) => ({ ...p, flip: !p.flip }))}
        onNego={() => fly(1)}
      />

      {match && (
        <MatchOverlay side={side} counterpartName={match.name} counterpartLogo={match.logo} onWatch={() => router.push(match.href)} onClose={() => setMatch(null)} />
      )}
    </>
  );
}
