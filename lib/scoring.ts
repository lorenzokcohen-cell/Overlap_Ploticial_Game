export type Tier = { max: number; pts: number; name: string; note: string; color: string; sq: string };

// Combined error = |guess D − actual D| + |guess R − actual R|
export const TIERS: Tier[] = [
  { max: 6,   pts: 100, name: "Common Ground",    note: "within 6 points", color: "var(--overlap)", sq: "🟪" },
  { max: 12,  pts: 80,  name: "Close Read",       note: "within 12",       color: "var(--t2)",      sq: "🟩" },
  { max: 20,  pts: 55,  name: "Fair Hearing",     note: "within 20",       color: "var(--t3)",      sq: "🟨" },
  { max: 32,  pts: 30,  name: "Across the Aisle", note: "within 32",       color: "var(--t4)",      sq: "🟧" },
  { max: 999, pts: 10,  name: "Miles Apart",      note: "more than 32",    color: "var(--t5)",      sq: "⬜" },
];

export function tierIndex(err: number) {
  return TIERS.findIndex((t) => err <= t.max);
}
