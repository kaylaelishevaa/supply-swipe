"use client";
// Demo helper for the /demo wrapper. A step URL can carry ?prep=reset (fresh demo data) or
// ?prep=seal (both owners approve, if the viewer skipped those taps), so each step looks right
// even when steps are opened out of order. Approvals still go through api.approve and the log.

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import * as api from "@/lib/api";
import { DEAL_ID } from "@/lib/mock";

export function DemoPrep() {
  const prep = useSearchParams().get("prep");
  useEffect(() => {
    if (prep === "reset") {
      api.resetDemo();
      try {
        localStorage.removeItem("supplyswipe.wakil.buyer");
        localStorage.removeItem("supplyswipe.wakil.supplier");
      } catch {
        // ignore
      }
    }
    if (prep === "seal")
      (async () => {
        const d = await api.getDeal(DEAL_ID);
        if (d.status === "sealed") return;
        if (d.status === "rejected") await api.resetDemo();
        await api.approve(DEAL_ID, "buyer", "owner");
        await api.approve(DEAL_ID, "supplier", "owner");
      })();
  }, [prep]);
  return null;
}
