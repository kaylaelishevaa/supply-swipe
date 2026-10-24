export default function TwoSidedWorkflow() {
  return (
    <div className="relative h-screen w-screen overflow-hidden bg-bg px-[6vw] py-[7vh] text-ink">
      <h1 className="font-display text-[4vw] font-extrabold leading-[1.05] tracking-[-0.04em]">
        One workflow for buyers and suppliers
      </h1>
      <div className="mt-[7vh] grid grid-cols-[1fr_auto_1fr_auto_1fr] items-stretch gap-[1.7vw]">
        <div className="rounded-[2vw] bg-purple-soft px-[2.2vw] py-[3vh]">
          <div className="font-display text-[2.5vw] font-extrabold text-primary">Buyer request</div>
          <p className="mt-[2vh] font-body text-[2vw] leading-[1.3]">
            Buyer request sets item, quantity, and delivery needs
          </p>
        </div>
        <div className="flex items-center font-display text-[3vw] font-bold text-primary">→</div>
        <div className="rounded-[2vw] bg-teal-soft px-[2.2vw] py-[3vh]">
          <div className="font-display text-[2.5vw] font-extrabold text-accent">Supplier listing</div>
          <p className="mt-[2vh] font-body text-[2vw] leading-[1.3]">
            Supplier listing shows price, minimum order, capacity, and delivery rules
          </p>
        </div>
        <div className="flex items-center font-display text-[3vw] font-bold text-primary">→</div>
        <div className="rounded-[2vw] bg-primary px-[2.2vw] py-[3vh] text-white">
          <div className="font-display text-[2.5vw] font-extrabold">Mutual swipe</div>
          <p className="mt-[2vh] font-body text-[2vw] leading-[1.3]">
            A mutual swipe starts a negotiation
          </p>
        </div>
      </div>
      <div className="mt-[5vh] grid grid-cols-2 gap-[4vw] border-t border-line pt-[3vh]">
        <p className="font-body text-[2vw] leading-[1.3]">
          Each side browses sample counterparties in the local prototype
        </p>
        <p className="font-body text-[2vw] leading-[1.3] text-muted">
          The demo uses seeded businesses and synthetic data
        </p>
      </div>
    </div>
  );
}
