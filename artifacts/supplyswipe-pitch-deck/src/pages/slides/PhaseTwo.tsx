const base = import.meta.env.BASE_URL;

export default function PhaseTwo() {
  return (
    <div className="relative h-screen w-screen overflow-hidden bg-bg px-[6vw] py-[7vh] text-ink">
      <h1 className="max-w-[90vw] font-display text-[4vw] font-extrabold leading-[1.05] tracking-[-0.04em]">
        Next: validate the value with food businesses
      </h1>
      <p className="mt-[1.6vh] font-body text-[2vw] font-semibold text-primary">
        PRD Phase 2 targets—not achieved results:
      </p>
      <div className="mt-[4vh] grid grid-cols-[1fr_1fr_1fr] gap-x-[3vw] gap-y-[3vh]">
        <div className="rounded-[2vw] bg-primary px-[2.2vw] py-[2.5vh] text-white">
          <p className="font-body text-[2vw] leading-[1.25]">
            At least <span className="font-display text-[4.3vw] font-extrabold leading-none">90%</span> fewer owner messages per agreed deal
          </p>
        </div>
        <div className="rounded-[2vw] bg-teal-soft px-[2.2vw] py-[2.5vh]">
          <p className="font-body text-[2vw] leading-[1.25]">
            Request to approved deal in under <span className="font-display text-[4.3vw] font-extrabold leading-none text-accent">5</span> minutes
          </p>
        </div>
        <div className="rounded-[2vw] bg-purple-soft px-[2.2vw] py-[2.5vh]">
          <p className="font-body text-[2vw] leading-[1.25]">
            Zero limit breaches in <span className="font-display text-[4.3vw] font-extrabold leading-none text-primary">50</span> test negotiations
          </p>
        </div>
      </div>
      <div className="mt-[3vh] grid grid-cols-[1fr_1fr] gap-[3vw] border-t border-line pt-[2.6vh]">
        <p className="font-body text-[2vw] leading-[1.3]">
          Compare every pilot invoice against pinned terms before payment
        </p>
        <p className="font-body text-[2vw] leading-[1.3]">
          Test with five outlets and two suppliers on synthetic data
        </p>
      </div>
      <img
        src={`${base}brand/supplyswipe-lockup.png`}
        crossOrigin="anonymous"
        alt="SupplySwipe"
        className="absolute bottom-[5vh] right-[6vw] w-[20vw] object-contain"
      />
    </div>
  );
}
