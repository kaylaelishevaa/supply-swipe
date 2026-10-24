const base = import.meta.env.BASE_URL;

export default function SupplySwipe() {
  return (
    <div className="relative h-screen w-screen overflow-hidden bg-bg text-ink">
      <div className="absolute inset-y-0 right-0 w-[39vw] bg-primary" />
      <div className="absolute bottom-0 right-0 h-[31vh] w-[39vw] bg-accent" />
      <div className="absolute left-[6vw] top-[10vh] flex h-[12vw] w-[12vw] items-center justify-center rounded-[3vw] bg-white">
        <img
          src={`${base}brand/supplyswipe-icon.png`}
          crossOrigin="anonymous"
          alt="SupplySwipe mark"
          className="h-[9vw] w-[9vw] object-contain"
        />
      </div>
      <div className="absolute left-[6vw] top-[42vh] max-w-[65vw]">
        <h1 className="font-display text-[7vw] font-extrabold leading-[0.98] tracking-[-0.055em] text-ink">
          SupplySwipe
        </h1>
        <p className="mt-[3vh] max-w-[52vw] font-body text-[2.7vw] font-semibold leading-[1.3] text-muted">
          Bounded negotiation for weekly food supply deals.
          <span className="mt-[1vh] block text-ink">Wakils negotiate. Owners decide.</span>
        </p>
      </div>
      <div className="absolute bottom-[8vh] left-[6vw] h-[0.7vh] w-[12vw] bg-primary" />
    </div>
  );
}
