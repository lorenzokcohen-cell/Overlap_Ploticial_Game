export function Mark({ size = 30 }: { size?: number }) {
  return (
    <svg width={size} height={(size * 22) / 30} viewBox="0 0 30 22" aria-hidden="true">
      <circle cx="11" cy="11" r="9" fill="none" stroke="var(--dem)" strokeWidth="3" />
      <circle cx="19" cy="11" r="9" fill="none" stroke="var(--rep)" strokeWidth="3" />
      <path d="M15 3.9a9 9 0 0 1 0 14.2a9 9 0 0 1 0-14.2z" fill="var(--overlap)" />
    </svg>
  );
}
