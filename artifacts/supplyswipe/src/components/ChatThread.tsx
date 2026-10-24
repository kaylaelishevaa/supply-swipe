// Human chat between the two businesses (S5). Their messages sit left (white), mine right (ink).

export interface ChatMsg {
  id: string;
  mine: boolean;
  text: string;
  by: string;
  at: string;
}

export function ChatThread({ messages }: { messages: ChatMsg[] }) {
  return (
    <>
      {messages.map((m) =>
        m.mine ? (
          <div key={m.id} className="max-w-[80%] self-end rounded-[14px_14px_4px_14px] bg-ink px-3 py-2.5 text-[13px] leading-[1.45] text-white">
            {m.text}
            <div className="mt-1 text-[10px] text-[#B9BFBA]">
              {m.by} · {m.at}
            </div>
          </div>
        ) : (
          <div key={m.id} className="max-w-[80%] self-start rounded-[14px_14px_14px_4px] border border-line bg-white px-3 py-2.5 text-[13px] leading-[1.45]">
            {m.text}
            <div className="mt-1 text-[10px] text-muted">
              {m.by} · {m.at}
            </div>
          </div>
        ),
      )}
    </>
  );
}
