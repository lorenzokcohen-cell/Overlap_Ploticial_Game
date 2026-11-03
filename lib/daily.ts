// Builds each day's puzzle automatically from the item pool.
// Same date → same puzzle for everyone. No cron job needed.

export type Item = {
  id: string;
  statement: string;
  d: number;
  r: number;
  source: string;   // e.g. "Pew Research Center, Apr 2025"
  url?: string;     // citation link (national polls)
  topic?: string;
  community?: boolean;
  n?: number;
};

export type Puzzle = {
  no: number;
  dateLabel: string;
  rounds: Item[];
  bonus: { prompt: string; options: Item[]; answer: number };
};

const TZ = "America/New_York";
const ROUNDS = 4;

/** Calendar date (YYYY-MM-DD) in New York for a given instant. */
export function nyDate(d = new Date()) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit" }).format(d);
}

export function puzzleNumber(today = nyDate()) {
  const launch = process.env.NEXT_PUBLIC_LAUNCH_DATE || "2026-11-03";
  const ms = Date.parse(today + "T00:00:00Z") - Date.parse(launch + "T00:00:00Z");
  return Math.max(1, Math.floor(ms / 86400000) + 1);
}

// Small seeded PRNG (mulberry32) so the shuffle is reproducible.
function rng(seed: number) {
  return () => {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function shuffle<T>(arr: T[], seed: number) {
  const a = [...arr], rand = rng(seed);
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Walk through the pool in a shuffled order so items don't repeat until
 * the whole pool has been used ("cycles"). The 4 bonus options are drawn
 * from a separate shuffle so they may repeat items seen in rounds.
 */
export function buildPuzzle(pool: Item[], no: number, dateLabel: string): Puzzle {
  const items = [...pool].sort((a, b) => a.id.localeCompare(b.id));
  if (items.length < ROUNDS + 4) throw new Error("Need at least 8 items in the pool");

  const perCycle = Math.floor(items.length / ROUNDS);
  const cycle = Math.floor((no - 1) / perCycle);
  const slot = (no - 1) % perCycle;
  const order = shuffle(items, 1000 + cycle);
  const rounds = order.slice(slot * ROUNDS, slot * ROUNDS + ROUNDS);

  // Bonus: 4 items from one topic whose "both-party floor" (min of D and R) has a clear winner.
  const rand = rng(50000 + no);
  const byTopic = new Map<string, Item[]>();
  for (const it of items) if (it.topic) byTopic.set(it.topic, [...(byTopic.get(it.topic) ?? []), it]);
  // Alternate days: a single-topic set (topics take turns), then a mixed set.
  const topics = [...byTopic.keys()].filter((t) => byTopic.get(t)!.length >= 4).sort();
  const roundIds = new Set(rounds.map((r) => r.id));
  const clear = (cand: Item[]) => {
    const f = cand.map((c) => Math.min(c.d, c.r));
    const best = Math.max(...f);
    const winner = cand[f.indexOf(best)];
    const second = [...f].sort((a, b) => b - a)[1];
    return best - second >= 8 && !roundIds.has(winner.id);
  };
  let options: Item[] = [];
  if (no % 2 === 0 && topics.length) {
    const t = topics[(no / 2) % topics.length];
    for (let tries = 0; tries < 80 && !options.length; tries++) {
      const cand = shuffle(byTopic.get(t)!, Math.floor(rand() * 1e9)).slice(0, 4);
      if (clear(cand)) options = cand;
    }
  }
  for (let tries = 0; tries < 200 && !options.length; tries++) {
    const cand = shuffle(items, Math.floor(rand() * 1e9)).slice(0, 4);
    if (clear(cand)) options = cand;
  }
  if (!options.length) options = shuffle(items, 777 + no).slice(0, 4);
  const floors = options.map((o) => Math.min(o.d, o.r));
  const answer = floors.indexOf(Math.max(...floors));

  return {
    no,
    dateLabel,
    rounds,
    bonus: { prompt: options[0].topic && options.every((o) => o.topic === options[0].topic)
      ? `${options[0].topic}: which idea has the most support from both parties?`
      : "Which idea has the most support from both parties at once?", options, answer },
  };
}
