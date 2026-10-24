// Small inline stroke icons used across screens (lock, chevron, X, undo, mic, check).

export function LockIcon({ size = 10, color = "#6A5CF0" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size * 1.1} viewBox="0 0 10 11" aria-hidden>
      <rect x="1" y="4.5" width="8" height="6" rx="1.5" fill={color} />
      <path d="M3 4.5V3a2 2 0 0 1 4 0v1.5" fill="none" stroke={color} strokeWidth="1.3" />
    </svg>
  );
}

export function ChevronLeft({ size = 14, color = "#1D1B2E" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" aria-hidden>
      <polyline points="9,2 4,7 9,12" fill="none" stroke={color} strokeWidth="1.6" />
    </svg>
  );
}

export function XIcon({ size = 22, color = "#E8664A" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 22 22" aria-hidden>
      <line x1="4" y1="4" x2="18" y2="18" stroke={color} strokeWidth="3" strokeLinecap="round" />
      <line x1="18" y1="4" x2="4" y2="18" stroke={color} strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

export function UndoIcon({ size = 18, color = "#E9A23B" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 18 18" aria-hidden>
      <path d="M5 7a5 5 0 1 1 0 5" fill="none" stroke={color} strokeWidth="2" />
      <polyline points="2,4 5,7 8,4" fill="none" stroke={color} strokeWidth="2" />
    </svg>
  );
}

export function MicIcon() {
  return (
    <svg width="12" height="16" viewBox="0 0 12 16" aria-hidden>
      <rect x="3" y="1" width="6" height="9" rx="3" fill="#1D1B2E" />
      <path d="M1 8a5 5 0 0 0 10 0M6 13v2" fill="none" stroke="#1D1B2E" strokeWidth="1.4" />
    </svg>
  );
}

export function CheckIcon({ size = 12, color = "#0E8A76" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 12 12" aria-hidden>
      <polyline points="2,6.5 5,9 10,3" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
