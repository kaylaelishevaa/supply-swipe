"use client";
// Form field and textarea: white, radius 18, small shadow, no border.

import type { ReactNode } from "react";

export function FieldLabel({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`text-[12px] font-semibold ${className}`}>{children}</div>;
}

export function Field({
  label,
  value,
  onChange,
  suffix,
  height = 48,
  placeholder,
  className = "",
}: {
  label?: ReactNode;
  value: string;
  onChange?: (v: string) => void;
  suffix?: ReactNode;
  height?: number;
  placeholder?: string;
  className?: string;
}) {
  return (
    <label className={`flex flex-col gap-1.5 ${className}`}>
      {label && <FieldLabel>{label}</FieldLabel>}
      <div style={{ height }} className="flex items-center justify-between gap-2 rounded-field bg-white px-4 shadow-field">
        <input
          value={value}
          placeholder={placeholder}
          readOnly={!onChange}
          onChange={(e) => onChange?.(e.target.value)}
          className="min-w-0 flex-1 bg-transparent text-[14px] text-ink outline-none placeholder:text-muted"
        />
        {suffix && <span className="text-[11px] text-muted">{suffix}</span>}
      </div>
    </label>
  );
}

export function TextArea({
  value,
  onChange,
  rows = 3,
  maxLength,
  placeholder,
  className = "",
}: {
  value: string;
  onChange: (v: string) => void;
  rows?: number;
  maxLength?: number;
  placeholder?: string;
  className?: string;
}) {
  return (
    <textarea
      value={value}
      rows={rows}
      maxLength={maxLength}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      className={`w-full resize-none rounded-field bg-white px-4 py-3 text-[14px] leading-[1.45] text-ink shadow-field outline-none placeholder:text-muted ${className}`}
    />
  );
}
