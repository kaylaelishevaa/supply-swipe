"use client";
// Inline "Reject with reason": a short reason field, then the rejection is written to the log.

import { useState } from "react";

export function RejectForm({ onReject, onCancel }: { onReject: (reason: string) => void; onCancel: () => void }) {
  const [reason, setReason] = useState("");
  return (
    <div className="flex flex-col gap-2 rounded-[18px] bg-coral-soft p-3">
      <input
        autoFocus
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        placeholder="Reason, e.g. price too high this week"
        className="h-11 rounded-[14px] bg-white px-3.5 text-[13px] text-ink outline-none placeholder:text-muted"
      />
      <div className="grid grid-cols-2 gap-2">
        <button onClick={onCancel} className="h-10 rounded-full bg-white text-[13px] font-semibold text-ink shadow-ctl">
          Cancel
        </button>
        <button onClick={() => onReject(reason.trim())} className="h-10 rounded-full bg-coral-text text-[13px] font-semibold text-white">
          Reject deal
        </button>
      </div>
      <div className="text-[11px] text-coral-text">The other owner sees that you rejected and your reason. Written to the log.</div>
    </div>
  );
}
