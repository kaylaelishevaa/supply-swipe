"use client";
// B1 New request: Aisyah posts this week's order. The public target goes out; the sealed max
// comes from the Wakil's limits and stays on this side.

import { useState } from "react";
import { Link } from "wouter";
import { useRouter } from "@/lib/navigation";
import * as api from "@/lib/api";
import { useApi } from "@/lib/useApi";
import { rm } from "@/lib/negotiation";
import { Screen } from "@/components/Screen";
import { StatusBar } from "@/components/StatusBar";
import { Field, FieldLabel } from "@/components/Field";
import { Button } from "@/components/Button";
import { LockIcon, MicIcon } from "@/components/Icons";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function NewRequestPage() {
  const router = useRouter();
  const [days, setDays] = useState<string[]>(["Mon", "Thu"]);
  const max = useApi(() => api.getOwnLimit("buyer"), []);
  const toggle = (d: string) => setDays((s) => (s.includes(d) ? s.filter((x) => x !== d) : [...s, d]));

  const post = async () => {
    await api.postRequest();
    router.push("/feed");
  };

  return (
    <Screen>
      <StatusBar />
      <div className="flex flex-none items-center justify-between px-4 pb-3.5 pt-1">
        <div>
          <div className="text-[22px] font-extrabold tracking-[-0.02em]">New request</div>
          <div className="mt-0.5 text-[12px] text-muted">Posting as Aisyah · kitchen lead</div>
        </div>
        <Link href="/feed" className="text-[13px] text-muted">
          Cancel
        </Link>
      </div>
      <div className="no-scrollbar flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-4">
        <Field label="Item" value="Chicken breast, skinless, grade A" suffix="Halal" />
        <div className="grid grid-cols-2 gap-2">
          <Field label="Quantity" value="50 kg" />
          <Field label="Frequency" value="Weekly" />
        </div>
        <div className="flex flex-col gap-1.5">
          <FieldLabel>Delivery days · before 9am</FieldLabel>
          <div className="grid grid-cols-6 gap-1.5">
            {DAYS.map((d) => {
              const on = days.includes(d);
              return (
                <button
                  key={d}
                  onClick={() => toggle(d)}
                  aria-pressed={on}
                  className={`flex h-10 items-center justify-center rounded-full text-[13px] ${
                    on ? "bg-ink font-semibold text-white shadow-ink" : "bg-white text-muted shadow-ctl"
                  }`}
                >
                  {d}
                </button>
              );
            })}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="flex flex-col gap-1.5">
            <FieldLabel>Target price · public</FieldLabel>
            <div className="flex h-14 items-center rounded-field bg-white px-4 text-[16px] font-semibold shadow-field">
              RM13.00<span className="text-[11px] font-normal text-muted">&nbsp;/kg</span>
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <FieldLabel className="flex items-center gap-1 text-purple-text">
              <LockIcon />
              Maximum · sealed
            </FieldLabel>
            <div className="flex h-14 flex-col justify-center rounded-[12px] bg-purple-soft px-3.5">
              <div className="text-[16px] font-semibold text-purple-text">
                {max != null ? rm(max) : ""}
                <span className="text-[11px] font-normal"> /kg</span>
              </div>
              <div className="text-[10px] text-purple-text">from your Wakil limits</div>
            </div>
          </div>
        </div>
        <Field label="Needed by" value="Mon 27 Oct, first delivery" />
        <div className="flex items-center gap-3 rounded-[12px] border border-dashed border-line px-3.5 py-3">
          <div className="flex h-9 w-9 flex-none items-center justify-center rounded-full border border-line bg-white">
            <MicIcon />
          </div>
          <div className="text-[12px] leading-[1.45] text-muted">
            Or send a voice note: <span className="text-ink">&apos;nak ayam 50 kilo seminggu, hantar Isnin Khamis&apos;</span>
          </div>
        </div>
      </div>
      <div className="flex-none px-4 pb-8 pt-4">
        <Button variant="primary" onClick={post}>
          Post and see suppliers
        </Button>
      </div>
    </Screen>
  );
}
