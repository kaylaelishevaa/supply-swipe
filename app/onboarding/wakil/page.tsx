"use client";
// S2a Meet your Wakil (step 3 of 4): live 3D preview, Look and Personality tabs.
// Changes save immediately through api.saveWakil and WakilAgent.set, so every agent updates
// without a reload. Notes only guide wording; prices always come from the sealed limits.

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import * as api from "@/lib/api";
import { useDemo } from "@/lib/demo-context";
import { DEFAULT_WAKIL } from "@/lib/mock";
import type { WakilProfile } from "@/lib/types";
import type { WakilPose } from "@/components/WakilAvatar";
import { Screen } from "@/components/Screen";
import { StatusBar } from "@/components/StatusBar";
import { Wakil } from "@/components/Wakil";
import { Button } from "@/components/Button";
import { LockIcon } from "@/components/Icons";

const HATS = [["chef", "Chef hat"], ["songkok", "Songkok"], ["cap", "Cap"], ["headset", "Headset"], ["none", "None"]] as const;
const FACES = [["happy", "Happy"], ["focus", "Focused"], ["calm", "Calm"]] as const;
const COLORS = [["purple", "#6A5CF0"], ["plum", "#7A3F9E"], ["indigo", "#3D4AB5"]] as const;
const LANGS = [["en", "EN"], ["bm", "BM"], ["mix", "Mix"]] as const;
const TONES = [["friendly", "Friendly"], ["formal", "Formal"]] as const;
const IDEAS = ["Ask for halal cert", "Drops before 8am", "No COD above RM500", "Prefer local farms"];

const inputCls = "h-[46px] rounded-field bg-white px-4 text-ink shadow-field outline-none placeholder:text-muted";

export default function CustomizeWakilPage() {
  const router = useRouter();
  const { side } = useDemo();
  const [cfg, setCfg] = useState<WakilProfile>(DEFAULT_WAKIL[side]);
  const [tab, setTab] = useState<"look" | "mind">("look");
  const [pose, setPose] = useState<WakilPose>("idle");
  const poseTimer = useRef<ReturnType<typeof setTimeout>>();
  const saveTimer = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    api.getWakil(side).then(setCfg);
  }, [side]);

  useEffect(
    () => () => {
      clearTimeout(poseTimer.current);
      clearTimeout(saveTimer.current);
    },
    [],
  );

  const flash = (p: WakilPose, ms: number) => {
    setPose(p);
    clearTimeout(poseTimer.current);
    poseTimer.current = setTimeout(() => setPose("idle"), ms);
  };

  // Look changes save at once (and the agent cheers); text changes save after a short pause.
  const save = (patch: Partial<WakilProfile>, look = false) => {
    const next = { ...cfg, ...patch };
    setCfg(next);
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(
      () => {
        api.saveWakil(side, next);
        window.WakilAgent?.set(side, next as unknown as Record<string, unknown>);
      },
      look ? 0 : 400,
    );
    if (look) flash("happy", 1400);
  };

  const reset = () => {
    const d = DEFAULT_WAKIL[side];
    setCfg(d);
    api.saveWakil(side, d);
    window.WakilAgent?.reset(side);
    flash("happy", 1400);
  };

  const addIdea = (label: string) => {
    const n = cfg.notes.trim();
    const sep = n ? (/[.!?]$/.test(n) ? " " : ". ") : "";
    save({ notes: (n + sep + label + ".").slice(0, 300) });
  };

  const remember = [cfg.notes, cfg.lookNote ? "Look request: " + cfg.lookNote : ""].filter(Boolean).join(" · ");
  const seg = "grid rounded-full bg-neutral p-[3px]";
  const segBtn = (on: boolean) => `flex items-center justify-center rounded-full text-[13px] font-semibold ${on ? "bg-white text-ink" : "text-muted"}`;

  return (
    <Screen>
      <StatusBar />
      <div className="flex flex-none flex-col gap-2.5 px-4 pt-2">
        <div className="grid grid-cols-4 gap-1.5">
          {[1, 2, 3, 4].map((i) => (
            <span key={i} className={`h-1 rounded-[2px] ${i <= 3 ? "bg-ink" : "bg-line"}`} />
          ))}
        </div>
        <div className="flex justify-between whitespace-nowrap text-[11px] text-muted">
          <span>Step 3 of 4 · Meet your Wakil</span>
          <button onClick={reset} className="font-semibold text-purple-text">
            Use default
          </button>
        </div>
      </div>

      {/* Preview */}
      <div className="relative mx-4 mt-2.5 h-[232px] flex-none overflow-hidden rounded-hero bg-white shadow-hero">
        <div className="absolute left-1/2 top-[60%] -ml-[100px] -mt-[100px] h-[200px] w-[200px] rounded-full bg-purple-soft opacity-70" />
        <Wakil
          side={side}
          width={358}
          height={232}
          pose={pose}
          spin
          interactive
          look={{ color: cfg.color, hat: cfg.hat, face: cfg.face }}
          className="absolute inset-0"
        />
        <div className="pointer-events-none absolute left-4 top-3.5 flex flex-col gap-0.5">
          <div className="whitespace-nowrap text-[16px] font-extrabold tracking-[-0.01em]">{cfg.name}</div>
          <div className="whitespace-nowrap text-[11px] text-muted">{side === "buyer" ? "Buyer" : "Supplier"} agent · drag to turn</div>
        </div>
        <button onClick={() => flash("speak", 1800)} className="absolute right-3 top-3 flex h-[30px] items-center whitespace-nowrap rounded-full bg-bg px-3 text-[12px] font-semibold">
          Say hi
        </button>
        {remember && (
          <div className="pointer-events-none absolute inset-x-3 bottom-3 rounded-[16px] bg-[rgba(230,227,255,0.92)] px-3 py-2 text-[11px] leading-[1.4] text-purple-text">
            <span className="font-semibold">Wakil will remember: </span>
            {remember.length > 110 ? remember.slice(0, 110) + "…" : remember}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="mx-4 mt-3 grid flex-none grid-cols-2 rounded-full bg-line p-1">
        {(
          [
            ["look", "Look"],
            ["mind", "Personality"],
          ] as const
        ).map(([v, label]) => (
          <button
            key={v}
            onClick={() => setTab(v)}
            className={`flex h-9 items-center justify-center rounded-full text-[13px] font-semibold ${
              tab === v ? "bg-white text-ink shadow-[0_4px_10px_rgba(60,55,120,0.12)]" : "text-muted"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="no-scrollbar flex min-h-0 flex-1 flex-col gap-3.5 overflow-y-auto px-4 pb-1 pt-3.5">
        {tab === "look" ? (
          <>
            <div className="flex flex-col gap-2">
              <div className="text-[12px] font-semibold">Headgear</div>
              <div className="flex flex-wrap gap-1.5">
                {HATS.map(([v, label]) => {
                  const on = cfg.hat === v;
                  return (
                    <button
                      key={v}
                      onClick={() => save({ hat: v }, true)}
                      aria-pressed={on}
                      className={`flex h-[34px] items-center whitespace-nowrap rounded-full px-3.5 text-[13px] font-semibold ${
                        on ? "bg-ink text-white" : "bg-white text-ink shadow-[0_4px_10px_rgba(60,55,120,0.08)]"
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <div className="text-[12px] font-semibold">Face</div>
              <div className={`${seg} grid-cols-3`}>
                {FACES.map(([v, label]) => (
                  <button key={v} onClick={() => save({ face: v }, true)} className={`h-[34px] ${segBtn(cfg.face === v)}`}>
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <div className="text-[12px] font-semibold">Colour</div>
              <div className="flex items-center gap-2.5">
                {COLORS.map(([v, hex]) => (
                  <button
                    key={v}
                    onClick={() => save({ color: v }, true)}
                    aria-label={v}
                    aria-pressed={cfg.color === v}
                    className="h-[38px] w-[38px] flex-none rounded-full"
                    style={{ background: hex, boxShadow: `0 0 0 3px #EFEEF6, 0 0 0 ${cfg.color === v ? "5px" : "0px"} #1D1B2E` }}
                  />
                ))}
                <div className="ml-1 flex-1 text-[11px] leading-[1.4] text-muted">Purple tones only, so Wakil messages are always easy to spot.</div>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <div className="text-[12px] font-semibold">Something not listed?</div>
              <input
                value={cfg.lookNote}
                onChange={(e) => save({ lookNote: e.target.value.slice(0, 80) })}
                placeholder="e.g. batik shirt, kopiah, apron with our logo"
                className={`${inputCls} text-[13px]`}
              />
              <div className="text-[11px] text-muted">We save it as a request and add it to your Wakil&apos;s wardrobe.</div>
            </div>
          </>
        ) : (
          <>
            <div className="flex flex-col gap-2">
              <div className="text-[12px] font-semibold">Name</div>
              <input value={cfg.name} onChange={(e) => save({ name: e.target.value.slice(0, 32) })} className={`${inputCls} text-[14px] font-semibold`} />
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              <div className="flex flex-col gap-2">
                <div className="text-[12px] font-semibold">Language</div>
                <div className={`${seg} grid-cols-3`}>
                  {LANGS.map(([v, label]) => (
                    <button key={v} onClick={() => save({ lang: v })} className={`h-8 !text-[12px] ${segBtn(cfg.lang === v)}`}>
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <div className="text-[12px] font-semibold">Tone</div>
                <div className={`${seg} grid-cols-2`}>
                  {TONES.map(([v, label]) => (
                    <button key={v} onClick={() => save({ tone: v })} className={`h-8 !text-[12px] ${segBtn(cfg.tone === v)}`}>
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex items-baseline justify-between">
                <div className="text-[12px] font-semibold">Tell your Wakil anything else</div>
                <div className="text-[11px] text-muted">{cfg.notes.length}/300</div>
              </div>
              <textarea
                value={cfg.notes}
                maxLength={300}
                onChange={(e) => save({ notes: e.target.value.slice(0, 300) })}
                placeholder="e.g. Always ask for the halal cert. We prefer drops before 8am. Be friendly with pak cik suppliers."
                className="min-h-[96px] resize-none rounded-[20px] bg-white px-4 py-3 text-[13px] leading-[1.5] text-ink shadow-field outline-none placeholder:text-muted"
              />
              <div className="flex flex-wrap gap-1.5">
                {IDEAS.map((label) => (
                  <button key={label} onClick={() => addIdea(label)} className="flex h-7 items-center whitespace-nowrap rounded-full bg-purple-soft px-3 text-[12px] font-semibold text-purple-text">
                    + {label}
                  </button>
                ))}
              </div>
              <div className="flex items-start gap-2 rounded-[16px] bg-white px-3 py-2.5 text-[11px] leading-[1.45] text-muted">
                <span className="mt-px flex-none">
                  <LockIcon size={12} />
                </span>
                <span>Notes guide how your Wakil talks and what it asks for. Prices still come from your sealed limits, and it can never break them.</span>
              </div>
            </div>
          </>
        )}
      </div>

      <div className="flex flex-none flex-col gap-2 px-4 pb-[30px] pt-2.5">
        <Button onClick={() => router.push("/onboarding/limits")}>Continue to limits</Button>
      </div>
    </Screen>
  );
}
