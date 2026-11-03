import { supabaseServer } from "@/lib/supabase/server";
import type { Item } from "@/lib/daily";

const COMMUNITY_MIN_N = 100; // per party side before a community question can enter the game

/** All playable items: sourced national polls + Overlap community polls with enough respondents. */
export async function loadPool(): Promise<Item[]> {
  const supabase = await supabaseServer();
  const [{ data: items }, { data: community }] = await Promise.all([
    supabase.from("game_items").select("id,statement,d,r,pollster,fielded,url,topic").eq("active", true),
    supabase.rpc("community_results", { min_n: COMMUNITY_MIN_N }),
  ]);
  const national: Item[] = (items ?? []).map((i) => ({
    id: i.id,
    statement: i.statement,
    d: i.d,
    r: i.r,
    source: [i.pollster, i.fielded].filter(Boolean).join(", "),
    url: i.url,
    topic: i.topic ?? undefined,
  }));
  const comm: Item[] = (community ?? []).map((c: { question_id: string; statement: string; d: number; r: number; n_d: number; n_r: number }) => ({
    id: "c-" + c.question_id,
    statement: c.statement,
    d: c.d,
    r: c.r,
    source: `Overlap community poll (${c.n_d} Democrats, ${c.n_r} Republicans; not a representative sample)`,
    topic: "Overlap community",
    community: true,
    n: c.n_d + c.n_r,
  }));
  return [...national, ...comm];
}
