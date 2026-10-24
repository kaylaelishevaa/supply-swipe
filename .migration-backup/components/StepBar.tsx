// Onboarding progress: 4 segments (ink when done, line otherwise) and "Step n of 4 · label".

export function StepBar({ step, label }: { step: number; label: string }) {
  return (
    <div className="flex flex-col gap-2.5 px-4 pt-2">
      <div className="grid grid-cols-4 gap-1.5">
        {[1, 2, 3, 4].map((i) => (
          <span key={i} className={`h-1 rounded-[2px] ${i <= step ? "bg-ink" : "bg-line"}`} />
        ))}
      </div>
      <div className="text-[11px] text-muted">
        Step {step} of 4 · {label}
      </div>
    </div>
  );
}
