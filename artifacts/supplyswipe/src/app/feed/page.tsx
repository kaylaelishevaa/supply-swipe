"use client";
// B2 Feed and swipe (buyer sees suppliers) / P2 Buyer requests feed (supplier sees buyers).
// Rule-based feed, no AI. Swiping right is the trigger that starts a negotiation.

import * as api from "@/lib/api";
import { useApi } from "@/lib/useApi";
import { useDemo } from "@/lib/demo-context";
import { Screen } from "@/components/Screen";
import { StatusBar } from "@/components/StatusBar";
import { TabBar } from "@/components/TabBar";
import { Wakil } from "@/components/Wakil";
import { SwipeDeck3D } from "@/components/SwipeDeck3D";

export default function FeedPage() {
  const { side } = useDemo();
  const cards = useApi(() => api.getFeed(side), [side]);
  const ownLimit = useApi(() => api.getOwnLimit(side), [side]);
  const buyer = side === "buyer";

  return (
    <Screen>
      <StatusBar />
      <div className="flex flex-none items-center gap-3 px-4 pb-3 pt-0.5">
        <div className="flex-1">
          <div className="text-[18px] font-semibold">{buyer ? "Suppliers for chicken breast" : "Buyers for chicken breast"}</div>
          <div className="mt-0.5 text-[11px] text-muted">
            {buyer ? "3 fit · 2 hidden (non-halal, out of area)" : "3 fit · 1 hidden (above your capacity)"}
          </div>
        </div>
        <Wakil side={side} width={50} height={54} pose="idle" turn={-18} bust />
      </div>
      {cards && ownLimit != null ? (
        // key resets the deck when the side switches
        <SwipeDeck3D key={side} side={side} cards={cards} ownLimit={ownLimit} />
      ) : (
        <div className="flex-1" />
      )}
      <TabBar active={buyer ? "feed" : "requests"} />
    </Screen>
  );
}
