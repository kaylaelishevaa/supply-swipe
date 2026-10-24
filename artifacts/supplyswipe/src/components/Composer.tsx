"use client";
// Chat composer: rounded input plus an ink send button. Enter also sends.

import { useState } from "react";

export function Composer({ placeholder, onSend }: { placeholder: string; onSend: (text: string) => void }) {
  const [text, setText] = useState("");
  const send = () => {
    const t = text.trim();
    if (!t) return;
    onSend(t);
    setText("");
  };
  return (
    <div className="flex flex-none items-center gap-2 bg-white px-4 pb-[30px] pt-2.5 shadow-[0_-8px_24px_rgba(60,55,120,0.06)]">
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && send()}
        placeholder={placeholder}
        className="h-11 min-w-0 flex-1 rounded-[22px] bg-bg px-4 text-[13px] text-ink outline-none placeholder:text-muted"
      />
      <button onClick={send} aria-label="Send" className="flex h-11 w-11 flex-none items-center justify-center rounded-full bg-ink">
        <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden>
          <polyline points="3,7 7,3 11,7" fill="none" stroke="#fff" strokeWidth="1.6" />
          <line x1="7" y1="3" x2="7" y2="12" stroke="#fff" strokeWidth="1.6" />
        </svg>
      </button>
    </div>
  );
}
