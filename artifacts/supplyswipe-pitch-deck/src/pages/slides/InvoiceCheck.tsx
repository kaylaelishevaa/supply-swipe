export default function InvoiceCheck() {
  return (
    <div className="relative h-screen w-screen overflow-hidden bg-bg px-[6vw] py-[7vh] text-ink">
      <h1 className="max-w-[88vw] font-display text-[4vw] font-extrabold leading-[1.05] tracking-[-0.04em]">
        Pin the agreement. Check the invoice.
      </h1>
      <div className="mt-[6vh] grid grid-cols-[1.08fr_0.92fr] gap-[5vw]">
        <div className="space-y-[2.5vh] font-body text-[2.1vw] leading-[1.35]">
          <p>Keep approved quantity, unit price, delivery, and payment terms visible</p>
          <p>Compare invoice values against the pinned deal</p>
          <p className="font-semibold text-coral">Flag mismatches and show the total difference</p>
        </div>
        <div className="rounded-[2.2vw] bg-white px-[2.4vw] py-[2.7vh]">
          <div className="grid grid-cols-[0.8fr_1fr_1fr] border-b border-line pb-[1.5vh] font-body text-[1.8vw] font-semibold text-muted">
            <span />
            <span>Pinned terms</span>
            <span>Invoice</span>
          </div>
          <div className="grid grid-cols-[0.8fr_1fr_1fr] gap-y-[1.8vh] py-[2vh] font-body text-[2vw]">
            <span>Quantity</span><span>Agreed</span><span>Compared</span>
            <span>Unit price</span><span>Agreed</span><span>Compared</span>
            <span>Delivery</span><span>Agreed</span><span>Compared</span>
            <span>Payment</span><span>Agreed</span><span>Compared</span>
          </div>
          <div className="mt-[1vh] rounded-[1.4vw] bg-coral-soft px-[1.6vw] py-[1.4vh] font-body text-[2vw] leading-[1.25] text-coral">
            The local demo compares sample invoice data; it does not ingest live invoices
          </div>
        </div>
      </div>
    </div>
  );
}
