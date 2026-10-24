"use client";
// S1 Onboarding (step 2 of 4): "Is this you?" pre-filled from the simulated Orbyte profile.

/* eslint-disable @next/next/no-img-element */
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Screen } from "@/components/Screen";
import { StatusBar } from "@/components/StatusBar";
import { StepBar } from "@/components/StepBar";
import { Field, FieldLabel } from "@/components/Field";
import { Button } from "@/components/Button";

const ITEMS = ["Chicken", "Eggs", "Vegetables", "Seafood", "Dry goods"];

export default function OnboardingPage() {
  const router = useRouter();
  const [name, setName] = useState("Restoran Mak Ngah");
  const [location, setLocation] = useState("Petaling Jaya, Selangor");
  const [type, setType] = useState<"buy" | "supply">("buy");
  const [halal, setHalal] = useState(true);
  const [items, setItems] = useState<string[]>(["Chicken", "Eggs", "Vegetables"]);

  const toggle = (i: string) => setItems((xs) => (xs.includes(i) ? xs.filter((x) => x !== i) : [...xs, i]));

  return (
    <Screen>
      <StatusBar />
      <div className="flex items-center justify-between px-4 pb-1.5 pt-1">
        <img src="/logos/supplyswipe-lockup.png" alt="SupplySwipe" className="-ml-1.5 block h-[30px] w-auto" />
        <span className="whitespace-nowrap text-[11px] text-muted">inside Orbyte</span>
      </div>
      <StepBar step={2} label="Your business" />
      <div className="px-4 pb-4 pt-5">
        <div className="text-[22px] font-extrabold tracking-[-0.02em]">Is this you?</div>
        <div className="mt-1 text-[13px] leading-[1.45] text-muted">We filled this in from your Orbyte profile. Change anything that is wrong.</div>
      </div>
      <div className="no-scrollbar flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-4">
        <Field label="Business name" value={name} onChange={setName} />
        <div className="flex flex-col gap-1.5">
          <FieldLabel>Type</FieldLabel>
          <div className="grid grid-cols-2 gap-2" role="radiogroup">
            {(
              [
                ["buy", "I buy supplies"],
                ["supply", "I supply"],
              ] as const
            ).map(([v, label]) => {
              const on = type === v;
              return (
                <button
                  key={v}
                  role="radio"
                  aria-checked={on}
                  onClick={() => setType(v)}
                  className={`flex h-12 items-center justify-between bg-white text-[14px] ${
                    on ? "rounded-[12px] border-[1.5px] border-ink px-3.5 font-semibold" : "rounded-field px-4 text-muted shadow-field"
                  }`}
                >
                  {label}
                  <span className={`h-4 w-4 rounded-full ${on ? "border-[5px] border-ink" : "border-[1.5px] border-line"}`} />
                </button>
              );
            })}
          </div>
          <div className="text-[11px] text-muted">Restaurant · 40 seats · 4 staff</div>
        </div>
        <Field label="Location" value={location} onChange={setLocation} />
        <button
          role="switch"
          aria-checked={halal}
          onClick={() => setHalal((h) => !h)}
          className="flex h-14 items-center justify-between rounded-field bg-white px-4 text-left shadow-field"
        >
          <div>
            <div className="text-[14px] font-semibold">Halal only</div>
            <div className="text-[11px] text-muted">Hides non-halal suppliers from your feed</div>
          </div>
          <div className={`flex h-[26px] w-11 rounded-[13px] p-[3px] transition-colors ${halal ? "justify-end bg-ink" : "justify-start bg-line"}`}>
            <span className="h-5 w-5 rounded-full bg-white" />
          </div>
        </button>
        <div className="flex flex-col gap-1.5">
          <FieldLabel>What you buy weekly</FieldLabel>
          <div className="flex flex-wrap gap-1.5">
            {ITEMS.map((i) => {
              const on = items.includes(i);
              return (
                <button
                  key={i}
                  onClick={() => toggle(i)}
                  aria-pressed={on}
                  className={`flex h-8 items-center whitespace-nowrap rounded-full px-3 text-[13px] ${
                    on ? "bg-ink font-semibold text-white" : "border border-line bg-white text-muted"
                  }`}
                >
                  {i}
                </button>
              );
            })}
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-2 px-4 pb-8 pt-4">
        <Button onClick={() => router.push("/onboarding/wakil")}>Continue</Button>
        <div className="text-center text-[12px] text-muted">Next: set your Wakil&apos;s limits</div>
      </div>
    </Screen>
  );
}
