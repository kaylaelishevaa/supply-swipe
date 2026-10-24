export default function MarketNumbers() {
  return (
    <div className="relative h-screen w-screen overflow-hidden bg-bg px-[6vw] py-[7vh] text-ink">
      <h1 className="max-w-[84vw] font-display text-[4vw] font-extrabold leading-[1.05] tracking-[-0.04em]">
        The pressure shows up in the numbers
      </h1>
      <div className="mt-[5vh] grid grid-cols-[1.05fr_1fr] items-center gap-[4vw]">
        <div className="rounded-[2.4vw] bg-primary px-[3vw] py-[3vh] text-white">
          <p className="font-display text-[7.4vw] font-extrabold leading-none tracking-[-0.06em]">
            1,086,386
          </p>
          <p className="mt-[2vh] font-body text-[2.1vw] font-semibold leading-[1.25]">
            Malaysian MSMEs (DOSM, 2024)
          </p>
        </div>
        <div className="grid grid-cols-2 gap-x-[2.4vw] gap-y-[2.2vh]">
          <div className="border-b border-line pb-[1.5vh]">
            <p className="font-body text-[2vw] leading-[1.25]">
              Grade C egg prices rose <span className="font-display text-[3.5vw] font-extrabold text-primary">7.3%</span> in a quarter of 2026
            </p>
          </div>
          <div className="border-b border-line pb-[1.5vh]">
            <p className="font-body text-[2vw] leading-[1.25]">
              Standard chicken rose <span className="font-display text-[3.5vw] font-extrabold text-accent">3.3%</span> to RM9.70/kg in Q1 2026
            </p>
          </div>
          <div className="col-span-2 rounded-[1.8vw] bg-coral-soft px-[2vw] py-[1.7vh]">
            <p className="font-body text-[2vw] leading-[1.2]">
              About <span className="font-display text-[3.5vw] font-extrabold text-coral">39%</span> of manually processed invoices contain errors
            </p>
          </div>
        </div>
      </div>
      <p className="absolute bottom-[6vh] left-[6vw] max-w-[85vw] font-body text-[1.55vw] leading-[1.35] text-muted">
        Sources cited in the PRD: DOSM MSME Statistics 2024; Ministry of Economy (price changes); Resolve Pay via NetSuite (invoice estimate). These are market-context figures, not SupplySwipe results.
      </p>
    </div>
  );
}
