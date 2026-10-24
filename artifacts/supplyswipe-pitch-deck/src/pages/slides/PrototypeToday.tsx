export default function PrototypeToday() {
  return (
    <div className="relative h-screen w-screen overflow-hidden bg-bg px-[6vw] py-[7vh] text-ink">
      <h1 className="max-w-[88vw] font-display text-[4vw] font-extrabold leading-[1.05] tracking-[-0.04em]">
        What works today—and what is optional
      </h1>
      <div className="mt-[5vh] grid grid-cols-2 gap-[3vw]">
        <div className="rounded-[2.2vw] bg-purple-soft px-[2.8vw] py-[2.8vh]">
          <h2 className="font-display text-[2.5vw] font-extrabold text-primary">Working locally</h2>
          <p className="mt-[2vh] font-body text-[2vw] leading-[1.35]">
            Working locally: sample workflows, seeded businesses, rule-based negotiation, approvals, invoice comparison, and browser-local persistence
          </p>
          <p className="mt-[2.2vh] border-t border-primary/20 pt-[2vh] font-body text-[2vw] leading-[1.35]">
            Not live by default: authenticated accounts, real supplier data, or a production database
          </p>
        </div>
        <div className="rounded-[2.2vw] bg-teal-soft px-[2.8vw] py-[2.8vh]">
          <h2 className="font-display text-[2.5vw] font-extrabold text-accent">Optional path</h2>
          <p className="mt-[2vh] font-body text-[2vw] leading-[1.35]">
            Optional path in the PRD: separately hosted FastAPI/Supabase backend and a GenAI API
          </p>
          <p className="mt-[2.2vh] border-t border-accent/20 pt-[2vh] font-body text-[2vw] leading-[1.35]">
            Backend, live data, and AI negotiation are not demonstrated by this local prototype
          </p>
        </div>
      </div>
    </div>
  );
}
