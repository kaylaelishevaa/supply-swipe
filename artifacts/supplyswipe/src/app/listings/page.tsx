"use client";
// P1 Listings (supplier): items with list price, MOQ, capacity and the sealed floor.
// The floor is the supplier's own sealed limit, so this screen only renders on the supplier side.

import { Screen } from "@/components/Screen";
import { StatusBar } from "@/components/StatusBar";
import { TabBar } from "@/components/TabBar";
import { Button } from "@/components/Button";
import { LockIcon } from "@/components/Icons";
import { useDemo } from "@/lib/demo-context";
import * as api from "@/lib/api";
import { useApi } from "@/lib/useApi";
import { rm } from "@/lib/negotiation";

function FloorRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-[10px] bg-purple-soft px-2.5 py-2">
      <span className="flex items-center gap-[5px] text-[11px] font-semibold text-purple-text">
        <LockIcon />
        {label}
      </span>
      <span className="text-[13px] font-semibold text-purple-text">{value}</span>
    </div>
  );
}

export default function ListingsPage() {
  const { side, setSide } = useDemo();
  const floor = useApi(() => api.getOwnLimit("supplier"), []);

  if (side !== "supplier") {
    return (
      <Screen>
        <StatusBar />
        <div className="flex flex-1 flex-col items-center justify-center gap-3 px-8 text-center">
          <div className="text-[18px] font-semibold">Listings are for suppliers</div>
          <div className="text-[13px] leading-[1.45] text-muted">Switch to Ayam Segar&apos;s view to see its items and sealed floors.</div>
          <div className="w-full">
            <Button variant="secondary" height={46} onClick={() => setSide("supplier")}>
              Switch to Ayam Segar
            </Button>
          </div>
        </div>
      </Screen>
    );
  }

  return (
    <Screen>
      <StatusBar />
      <div className="flex items-center justify-between px-4 pb-3.5 pt-1">
        <div>
          <div className="text-[22px] font-extrabold tracking-[-0.02em]">Listings</div>
          <div className="mt-0.5 whitespace-nowrap text-[12px] text-muted">Ayam Segar · 3 items</div>
        </div>
        <button className="flex h-9 flex-none items-center whitespace-nowrap rounded-[10px] border border-line bg-white px-3.5 text-[13px] font-semibold">Add item</button>
      </div>

      <div className="no-scrollbar flex min-h-0 flex-1 flex-col gap-2.5 overflow-y-auto px-4">
        <div className="flex flex-col gap-2.5 rounded-[21px] bg-white p-3.5 shadow-card">
          <div className="flex justify-between text-[14px] font-semibold">
            <span>Chicken breast, skinless</span>
            <span>
              RM12.80<span className="text-[11px] font-normal text-muted"> /kg</span>
            </span>
          </div>
          <div className="flex flex-wrap gap-x-3 gap-y-1 whitespace-nowrap text-[11px] text-muted">
            <span>MOQ 30 kg</span>
            <span>Capacity 1,200 kg/wk</span>
          </div>
          <FloorRow label="Floor · only your Wakil sees this" value={floor != null ? rm(floor) : ""} />
        </div>

        <div className="flex flex-col gap-2.5 rounded-[14px] border-[1.5px] border-amber bg-white p-3.5">
          <div className="flex items-center justify-between">
            <span className="text-[14px] font-semibold">Eggs, grade C · tray of 30</span>
            <span className="flex h-[22px] items-center whitespace-nowrap rounded-full bg-amber-soft px-2 text-[11px] font-semibold text-amber-text">Price review</span>
          </div>
          <div className="flex flex-wrap gap-x-3 gap-y-1 whitespace-nowrap text-[11px] text-muted">
            <span>RM12.90 /tray</span>
            <span>MOQ 10 trays</span>
            <span>Capacity 800/wk</span>
          </div>
          <div className="text-[11px] leading-[1.45] text-amber-text">Farm price up 7.3% this quarter. Your floor may now be below cost.</div>
          <FloorRow label="Floor" value="RM11.60" />
        </div>

        <div className="flex flex-col gap-2.5 rounded-[21px] bg-white p-3.5 shadow-card">
          <div className="flex justify-between text-[14px] font-semibold">
            <span>Whole chicken, 1.6 kg</span>
            <span>
              RM9.90<span className="text-[11px] font-normal text-muted"> /kg</span>
            </span>
          </div>
          <div className="flex flex-wrap gap-x-3 gap-y-1 whitespace-nowrap text-[11px] text-muted">
            <span>MOQ 20 birds</span>
            <span>Capacity 2,000/wk</span>
            <span className="font-semibold text-purple-text">Floor sealed</span>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <div className="text-[12px] font-semibold">Delivery rules</div>
          <div className="rounded-[20px] bg-white px-3.5 py-3 text-[13px] leading-[1.5] shadow-card">PJ, Shah Alam, Subang · Mon–Sat 7–11am · RM10 below 40 kg, free above</div>
        </div>
      </div>

      <TabBar active="listings" />
    </Screen>
  );
}
