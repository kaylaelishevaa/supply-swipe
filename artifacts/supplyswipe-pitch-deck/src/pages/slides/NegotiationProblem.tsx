export default function NegotiationProblem() {
  return (
    <div className="relative h-screen w-screen overflow-hidden bg-bg px-[6vw] py-[7vh] text-ink">
      <h1 className="max-w-[78vw] font-display text-[4vw] font-extrabold leading-[1.05] tracking-[-0.04em]">
        The costly loop is negotiation and memory
      </h1>
      <div className="mt-[6vh] grid grid-cols-[0.72fr_1.28fr] items-start gap-[5vw]">
        <div className="rounded-[2.5vw] bg-teal-soft px-[3vw] py-[4vh]">
          <p className="font-body text-[2.2vw] font-semibold leading-[1.25]">
            Buyers renegotiate with <span className="font-display text-[5vw] font-extrabold text-accent">3–8</span> suppliers almost every week
          </p>
        </div>
        <div className="space-y-[2.4vh] pt-[1vh] font-body text-[2.1vw] leading-[1.3]">
          <p className="border-b border-line pb-[2vh]">
            WhatsApp threads repeat the same price, delivery, and payment questions
          </p>
          <p className="border-b border-line pb-[2vh]">
            Suppliers repeat quotes to many leads and chase confirmations
          </p>
          <p className="border-b border-line pb-[2vh]">
            Agreed terms can be misquoted when an invoice arrives
          </p>
        </div>
      </div>
      <div className="absolute bottom-[7vh] left-[6vw] max-w-[82vw] font-display text-[3vw] font-bold leading-[1.14] tracking-[-0.035em] text-primary">
        The burden is not ordering; it is negotiating and remembering
      </div>
    </div>
  );
}
