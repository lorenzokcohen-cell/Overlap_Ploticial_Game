import { loadPool } from "@/lib/pool";
import { buildPuzzle, nyDate, puzzleNumber } from "@/lib/daily";
import Game from "./components/Game";
import { supabaseServer } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function Home() {
  const today = nyDate();
  const no = puzzleNumber(today);
  const label = new Intl.DateTimeFormat("en-US", {
    timeZone: "UTC", weekday: "long", month: "long", day: "numeric", year: "numeric",
  }).format(new Date(today + "T12:00:00Z"));

  const pool = await loadPool();
  if (pool.length < 8) {
    return (
      <div className="col center">
        <h1 className="title">Overlap</h1>
        <p className="muted">Today's puzzle isn't ready yet. Add poll items to the database (see the README).</p>
      </div>
    );
  }
  const puzzle = buildPuzzle(pool, no, label);

  const supabase = await supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  let streak = 0;
  if (user) {
    const { data } = await supabase.from("game_plays").select("puzzle_no").order("puzzle_no", { ascending: false }).limit(400);
    const played = new Set((data ?? []).map((p) => p.puzzle_no));
    let k = played.has(no) ? no : no - 1;
    while (played.has(k)) { streak++; k--; }
  }
  return <Game puzzle={puzzle} signedIn={!!user} streak={streak} />;
}
