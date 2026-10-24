"use client";
// S6 Activity log: append-only timeline. Owners see every row for their side; staff see only their own.

import * as api from "@/lib/api";
import { useApi } from "@/lib/useApi";
import { useDemo } from "@/lib/demo-context";
import { Screen } from "@/components/Screen";
import { StatusBar } from "@/components/StatusBar";
import { RoleSwitcher } from "@/components/RoleSwitcher";
import { LogLegend, LogTimeline } from "@/components/LogTimeline";
import { TabBar } from "@/components/TabBar";

export default function LogPage() {
  const { side, role } = useDemo();
  const rows = useApi(() => api.getLog(side, role), [side, role]) ?? [];

  return (
    <Screen>
      <StatusBar />
      <div className="flex flex-none items-center justify-between px-4 pb-3 pt-1">
        <div>
          <div className="text-[22px] font-extrabold tracking-[-0.02em]">Activity log</div>
          <div className="mt-0.5 text-[12px] text-muted">Deal #SS-0142 · chicken breast</div>
        </div>
        <RoleSwitcher bordered />
      </div>
      <div className="flex-none px-4 pb-2.5">
        <LogLegend />
      </div>
      <div className="no-scrollbar mx-4 min-h-0 flex-1 overflow-y-auto rounded-[21px] bg-white px-3.5 py-1.5 shadow-card">
        <LogTimeline rows={rows} />
      </div>
      <div className="flex-none px-4 pb-3 pt-3 text-center text-[11px] leading-[1.45] text-muted">
        Append-only. Staff see their own actions; owners see everything.
      </div>
      <TabBar active="log" />
    </Screen>
  );
}
