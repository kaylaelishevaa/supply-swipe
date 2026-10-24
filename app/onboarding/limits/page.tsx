"use client";
// S2 Limits (step 4 of 4): the buyer owner sets the Wakil's public target and sealed maximum,
// delivery, payment, negotiating style and the staff approval limit. Sealed values show only here.

import { useState } from "react";
import { useRouter } from "next/navigation";
import * as api from "@/lib/api";
import { useApi } from "@/lib/useApi";
import { rm } from "@/lib/negotiation";
import { Screen } from "@/components/Screen";
import { StatusBar } from "@/components/StatusBar";
import { StepBar } from "@/components/StepBar";
import { Wakil } from "@/components/Wakil";
import { LockCard, SealedNote } from "@/components/LockCard";
import { SegmentedControl } from "@/components/SegmentedControl";
import { Button } from "@/components/Button";

type Style = "firm" | "balanced" | "flexible";
const STYLE_NOTE: Record<Style, string> = {
  firm: "Firm opens low and moves only when the other side does.",
  balanced: "Balanced opens near market and moves in small steps.",
  flexible: "Flexible closes faster and gives a little more on price.",
};
const STYLE_LABEL: Record<Style, string> = { firm: "Firm", balanced: "Balanced", flexible: "Flexible" };

export default function LimitsPage() {
  const router = useRouter();
  const [style, setStyle] = useState<Style>("balanced");
  const max = useApi(() => api.getOwnLimit("buyer"), []);

  const save = async () => {
    await api.log(
      { side: "buyer", kind: "human", staffVisible: false, action: "Saved Wakil limits", actor: "Mak Ngah · owner", reason: `Chicken breast · ${STYLE_LABEL[style]} · staff up to RM500`, at: "08:58" },
      "limits:chicken",
    );
    router.push("/requests/new");
  };

  return (
    <Screen>
      <StatusBar />
      <StepBar step={4} label="Your Wakil's limits" />
      <div className="flex-none px-4 pb-3 pt-4">
        <div className="text-[22px] font-extrabold tracking-[-0.02em]">Set your Wakil&apos;s limits</div>
      </div>
      <div className="no-scrollbar flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-4">
        <div className="flex items-center gap-2.5 rounded-[21px] bg-white p-3 shadow-card">
          <Wakil side="buyer" width={52} height={56} turn={-20} bust className="-my-2" />
          <div className="flex-1">
            <div className="text-[14px] font-semibold">Wakil Mak Ngah</div>
            <div className="text-[11px] text-muted">Buyer · {STYLE_LABEL[style]} · trust 92</div>
          </div>
          <div className="text-[11px] font-semibold text-purple-text">Agent</div>
        </div>

        <div className="flex flex-col gap-3 rounded-[21px] bg-white p-3.5 shadow-card">
          <div className="flex items-baseline justify-between">
            <div className="text-[14px] font-semibold">Chicken breast, skinless</div>
            <div className="text-[11px] text-muted">1 of 3 items</div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-[12px] border border-line px-3 py-2.5">
              <div className="text-[11px] text-muted">Target · public</div>
              <div className="mt-0.5 text-[17px] font-semibold">
                RM13.00<span className="text-[11px] font-normal text-muted"> /kg</span>
              </div>
            </div>
            <LockCard label="Maximum · sealed" value={max != null ? rm(max) : ""} />
          </div>
          <SealedNote who="supplier" />
          <div className="h-px bg-line" />
          <div className="flex justify-between text-[13px]">
            <span className="text-muted">Delivery</span>
            <span className="font-semibold">Mon, Thu · before 9am</span>
          </div>
          <div className="flex justify-between text-[13px]">
            <span className="text-muted">Payment</span>
            <span className="font-semibold">7-day terms, COD ok</span>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <div className="text-[12px] font-semibold">Negotiating style</div>
          <SegmentedControl
            value={style}
            onChange={setStyle}
            options={(["firm", "balanced", "flexible"] as const).map((v) => ({ value: v, label: STYLE_LABEL[v] }))}
          />
          <div className="text-[11px] text-muted">{STYLE_NOTE[style]}</div>
        </div>

        <div className="flex items-center justify-between rounded-[21px] bg-white px-3.5 py-3 shadow-card">
          <div>
            <div className="text-[13px] font-semibold">Staff can approve up to</div>
            <div className="text-[11px] text-muted">Aisyah, kitchen lead. Above this, you approve.</div>
          </div>
          <div className="text-[17px] font-semibold">RM500</div>
        </div>
      </div>
      <div className="flex-none px-4 pb-8 pt-4">
        <Button variant="primary" onClick={save}>
          Save limits
        </Button>
      </div>
    </Screen>
  );
}
