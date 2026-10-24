export default function OwnerApproval() {
  return (
    <div className="relative h-screen w-screen overflow-hidden bg-bg px-[6vw] py-[7vh] text-ink">
      <h1 className="max-w-[85vw] font-display text-[4vw] font-extrabold leading-[1.05] tracking-[-0.04em]">
        Owners approve every proposed deal
      </h1>
      <div className="mt-[6vh] grid grid-cols-[1fr_0.78fr_1fr] items-center gap-[2.4vw]">
        <div className="rounded-[2vw] bg-white px-[2.4vw] py-[3vh]">
          <p className="font-body text-[2.1vw] leading-[1.35]">
            Review price, quantity, schedule, and payment terms
          </p>
          <p className="mt-[2.5vh] border-t border-line pt-[2vh] font-body text-[2.1vw] leading-[1.35]">
            See why the Wakil accepted and compare the result with limits
          </p>
        </div>
        <div className="flex flex-col items-center">
          <div className="flex h-[7vw] w-[7vw] items-center justify-center rounded-full bg-teal-soft font-display text-[3.5vw] font-extrabold text-accent">
            ✓
          </div>
          <p className="mt-[1.5vh] text-center font-body text-[2vw] font-semibold leading-[1.25]">
            A deal seals only after both owners approve
          </p>
        </div>
        <div className="rounded-[2vw] bg-white px-[2.4vw] py-[3vh]">
          <p className="font-body text-[2.1vw] leading-[1.35]">
            Approve, reject with a reason, or counter through the Wakil
          </p>
          <p className="mt-[2.5vh] border-t border-line pt-[2vh] font-body text-[2.1vw] leading-[1.35] text-muted">
            Staff approvals follow role limits in the prototype
          </p>
        </div>
      </div>
    </div>
  );
}
