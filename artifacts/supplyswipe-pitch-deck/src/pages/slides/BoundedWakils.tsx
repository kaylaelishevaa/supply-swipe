const base = import.meta.env.BASE_URL;

export default function BoundedWakils() {
  return (
    <div className="relative h-screen w-screen overflow-hidden bg-bg px-[6vw] py-[7vh] text-ink">
      <h1 className="font-display text-[4vw] font-extrabold leading-[1.05] tracking-[-0.04em]">
        Wakils negotiate within private limits
      </h1>
      <div className="mt-[5vh] grid grid-cols-[1fr_0.72fr_1fr] items-center gap-[3vw]">
        <div className="rounded-[2.2vw] bg-purple-soft px-[2.5vw] py-[3vh]">
          <img
            src={`${base}brand/supplyswipe-icon.png`}
            crossOrigin="anonymous"
            alt=""
            className="h-[5vw] w-[5vw] object-contain"
          />
          <p className="mt-[1.6vh] font-body text-[2.1vw] font-semibold leading-[1.3]">
            Each side has its own sealed limit
          </p>
        </div>
        <div className="text-center">
          <div className="mx-auto flex h-[10vw] w-[10vw] items-center justify-center rounded-full bg-primary font-display text-[4vw] font-extrabold text-white">
            ↔
          </div>
          <p className="mt-[1.4vh] font-body text-[2vw] leading-[1.25]">
            The working prototype uses rule-based Wakils, not a live AI model
          </p>
        </div>
        <div className="rounded-[2.2vw] bg-teal-soft px-[2.5vw] py-[3vh]">
          <img
            src={`${base}brand/supplyswipe-icon.png`}
            crossOrigin="anonymous"
            alt=""
            className="h-[5vw] w-[5vw] object-contain"
          />
          <p className="mt-[1.6vh] font-body text-[2.1vw] font-semibold leading-[1.3]">
            Offers outside a side’s own limit are blocked
          </p>
        </div>
      </div>
      <div className="mt-[5vh] grid grid-cols-2 gap-[4vw] border-t border-line pt-[3vh]">
        <p className="font-body text-[2vw] leading-[1.3]">
          A message cap keeps negotiation bounded
        </p>
        <p className="font-body text-[2vw] leading-[1.3]">
          If limits do not meet, the process returns without a deal
        </p>
      </div>
    </div>
  );
}
