export default function AuditHistory() {
  return (
    <div className="relative h-screen w-screen overflow-hidden bg-bg px-[6vw] py-[7vh] text-ink">
      <h1 className="font-display text-[4vw] font-extrabold leading-[1.05] tracking-[-0.04em]">
        Keep an audit trail and deal history
      </h1>
      <div className="mt-[6vh] grid grid-cols-[0.8fr_1.2fr] gap-[5vw]">
        <div className="rounded-[2vw] bg-primary px-[3vw] py-[3.2vh] text-white">
          <p className="font-body text-[2vw] leading-[1.35]">
            <span className="font-display text-[3vw] font-extrabold leading-[1.05]">Append-only</span> activity history captures negotiation and approval actions
          </p>
        </div>
        <div className="space-y-[2.4vh] font-body text-[2.1vw] leading-[1.35]">
          <p className="border-b border-line pb-[2vh]">
            Owners see the full history for their side; staff see their permitted actions
          </p>
          <p className="border-b border-line pb-[2vh]">
            Past supplier deals help frame a later renegotiation
          </p>
          <p className="text-muted">
            History and trust indicators in the demo are synthetic, not verified records
          </p>
        </div>
      </div>
    </div>
  );
}
