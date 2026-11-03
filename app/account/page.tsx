import Link from "next/link";
import { supabaseServer } from "@/lib/supabase/server";
import { ResultCard } from "../typology/Quiz";
import AccountActions from "./AccountActions";
export const metadata = { title: "Account · Overlap" };

export default async function Page() {
  const supabase = await supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  const [{ data: profile }, { data: typo }, { data: plays }, { count: answered }] = await Promise.all([
    supabase.from("profiles").select("consent_at,party").eq("id", user!.id).maybeSingle(),
    supabase.from("typology_results").select("category,econ_score,social_score").order("created_at", { ascending: false }).limit(1).maybeSingle(),
    supabase.from("game_plays").select("puzzle_no,score").order("puzzle_no", { ascending: false }),
    supabase.from("poll_responses").select("question_id", { count: "exact", head: true }),
  ]);
  const games = plays ?? [];
  const best = games.reduce((m, p) => Math.max(m, p.score), 0);
  const avg = games.length ? Math.round(games.reduce((a, p) => a + p.score, 0) / games.length) : 0;
  let streak = 0;
  if (games.length) {
    const set = new Set(games.map((g) => g.puzzle_no));
    let k = games[0].puzzle_no;
    while (set.has(k)) { streak++; k--; }
  }

  return (
    <div className="col">
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <p className="eyebrow">Your account</p>
        <h1 className="title" style={{ fontSize: 40 }}>Hi there</h1>
        <p className="muted" style={{ margin: 0 }}>{user!.email}</p>
      </div>

      <div className="stat-row" style={{ textAlign: "center" }}>
        <div><b>{games.length}</b><span>Games played</span></div>
        <div><b>{avg}</b><span>Average score</span></div>
        <div><b>{streak}</b><span>Latest streak</span></div>
      </div>
      {best > 0 && <p className="small muted" style={{ margin: 0 }}>Best score: {best} / 500</p>}

      {typo
        ? <ResultCard categoryId={typo.category} econ={typo.econ_score} social={typo.social_score} />
        : <div className="wash">You haven't taken the typology quiz yet. <Link href="/typology">Find your political type</Link>.</div>}

      <nav className="list" aria-label="Account">
        <Link href="/profile"><span>Profile and research consent</span><span className="muted">{profile?.consent_at ? "Counted" : "Not counted"}</span></Link>
        <Link href="/polls"><span>Polls</span><span className="muted">{answered ?? 0} answered</span></Link>
        <Link href="/typology"><span>Typology quiz</span><span className="muted">{typo ? "Retake" : "Start"}</span></Link>
        <Link href="/account/password"><span>Change password</span><span className="muted">›</span></Link>
        <Link href="/privacy"><span>Privacy policy</span><span className="muted">›</span></Link>
      </nav>

      <AccountActions />
    </div>
  );
}
