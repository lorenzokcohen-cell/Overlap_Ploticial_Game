"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { Item, Puzzle } from "@/lib/daily";
import { TIERS, tierIndex } from "@/lib/scoring";
import { supabaseBrowser } from "@/lib/supabase/client";
import { Mark } from "./Logo";

type Guess = { gd: number; gr: number; err: number; pts: number; tier: number; gapGuess: number; gapReal: number };
type State = {
  screen: "splash" | "game" | "results";
  i: number;
  phase: "guess" | "reveal";
  gd: number;
  gr: number;
  guesses: Guess[];
  bonusPick: number | null;
};
const fresh: State = { screen: "splash", i: 0, phase: "guess", gd: 50, gr: 50, guesses: [], bonusPick: null };

function Track({ d, r, hollow }: { d: number; r: number; hollow?: boolean }) {
  const lo = Math.min(d, r), hi = Math.max(d, r);
  return (
    <div className="track" aria-hidden="true">
      <div className="line" />
      <div className="band" style={{ left: `${lo}%`, width: `${hi - lo}%` }} />
      <div className={`dot d ${hollow ? "hollow" : ""}`} style={{ left: `${d}%` }}>D</div>
      <div className={`dot r ${hollow ? "hollow" : ""}`} style={{ left: `${r}%` }}>R</div>
    </div>
  );
}
const Ticks = () => (
  <div className="ticks"><span>0%</span><span>25</span><span>50</span><span>75</span><span>100%</span></div>
);
function Source({ item }: { item: Item }) {
  return (
    <p className="source">
      Source: {item.url ? <a href={item.url} target="_blank" rel="noreferrer">{item.source}</a> : item.source}
    </p>
  );
}

export default function Game({ puzzle, signedIn, streak }: { puzzle: Puzzle; signedIn: boolean; streak: number }) {
  const KEY = "overlap-" + puzzle.no;
  const TOTAL = puzzle.rounds.length + 1;
  const MAX = TOTAL * 100;
  const [s, setS] = useState<State>(fresh);
  const [actualShown, setActualShown] = useState(false);
  const [toast, setToast] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    try { const raw = localStorage.getItem(KEY); if (raw) setS(JSON.parse(raw)); } catch {}
  }, [KEY]);
  useEffect(() => { try { localStorage.setItem(KEY, JSON.stringify(s)); } catch {} }, [s, KEY]);
  useEffect(() => {
    if (s.phase === "reveal") { setActualShown(false); const t = setTimeout(() => setActualShown(true), 60); return () => clearTimeout(t); }
  }, [s.phase, s.i]);

  const total = s.guesses.reduce((a, g) => a + g.pts, 0) + (s.screen === "results" && s.bonusPick === puzzle.bonus.answer ? 100 : 0);
  const running = s.guesses.reduce((a, g) => a + g.pts, 0);

  const results = useMemo(() => {
    const bonusPts = s.bonusPick === puzzle.bonus.answer ? 100 : 0;
    const score = s.guesses.reduce((a, g) => a + g.pts, 0) + bonusPts;
    const over = s.guesses.length ? Math.round(s.guesses.reduce((a, g) => a + (g.gapGuess - g.gapReal), 0) / s.guesses.length) : 0;
    const sq = s.guesses.map((g) => TIERS[g.tier].sq).join("") + (bonusPts ? "🟪" : "⬜");
    return { score, over, sq, bonusPts };
  }, [s, puzzle.bonus.answer]);

  // Save the finished game for signed-in players (streaks, history).
  useEffect(() => {
    if (s.screen !== "results" || !signedIn || saved) return;
    (async () => {
      const supabase = supabaseBrowser();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      await supabase.from("game_plays").upsert({
        user_id: user.id, puzzle_no: puzzle.no, score: results.score, gap_over: results.over,
        rounds: { guesses: s.guesses, bonusPick: s.bonusPick, items: puzzle.rounds.map((r) => r.id) },
      }, { onConflict: "user_id,puzzle_no", ignoreDuplicates: true });
      setSaved(true);
    })();
  }, [s.screen, signedIn, saved, puzzle, results, s.guesses, s.bonusPick]);

  const shareText = () => {
    const gapLine = results.over > 1 ? `I overestimated the divide by ${results.over} pts`
      : results.over < -1 ? `I underestimated the divide by ${-results.over} pts` : "I read the divide almost exactly";
    return `Overlap No. ${puzzle.no} · ${results.score}/${MAX}\n${results.sq}\n${gapLine}\n${typeof window !== "undefined" ? window.location.origin : ""}`;
  };
  const flash = (m: string) => { setToast(m); setTimeout(() => setToast(""), 1800); };

  const Progress = () => (
    <div className="progress">
      {Array.from({ length: TOTAL }, (_, k) => (
        <span key={k} className={k < s.i || (k === s.i && s.phase === "reveal") ? "on" : ""} />
      ))}
    </div>
  );

  // ── Splash ──────────────────────────────────────────────
  if (s.screen === "splash") {
    const started = s.guesses.length > 0;
    return (
      <div className="col center" style={{ paddingTop: 16 }}>
        <Mark size={84} />
        <h1 className="title">Overlap</h1>
        <p className="dek" style={{ maxWidth: "22ch" }}>Guess where the other side actually stands.</p>
        <div className="btn-row">
          <button className="btn btn-primary" onClick={() => setS({ ...s, screen: "game" })}>{started ? "Continue" : "Play"}</button>
        </div>
        <p className="small muted" style={{ margin: 0 }}>
          <b style={{ color: "var(--ink)" }}>{puzzle.dateLabel}</b><br />No. {puzzle.no} · 5 rounds · about 3 minutes
          {signedIn && streak > 0 ? <><br />Current streak: {streak} {streak === 1 ? "day" : "days"}</> : null}
        </p>
        <section className="panel" style={{ textAlign: "left", width: "100%" }}>
          <h2 style={{ fontFamily: "var(--display)", fontSize: 20, margin: 0 }}>How to play</h2>
          <ul style={{ margin: 0, paddingLeft: 20, display: "flex", flexDirection: "column", gap: 4 }}>
            <li>Read a statement from a real, published poll.</li>
            <li>Guess what share of Democrats and of Republicans agree.</li>
            <li>The closer both guesses land, the more points you earn.</li>
            <li>Round 5: pick the idea both parties back most.</li>
          </ul>
          <div className="tiers">
            {TIERS.map((t) => (
              <div key={t.name} style={{ display: "contents" }}>
                <span className="sw" style={{ background: t.color }} />
                <span><b>{t.name}</b> <span className="muted">{t.note}</span></span>
                <span className="muted" style={{ fontVariantNumeric: "tabular-nums" }}>{t.pts} pts</span>
              </div>
            ))}
          </div>
          <p className="fine">Numbers come from nonpartisan pollsters such as Pew, Gallup and AP-NORC. Democrats and Republicans include independents who lean toward each party when the pollster reports it that way. Every answer links to its source.</p>
        </section>
        {!signedIn && (
          <p className="small muted" style={{ margin: 0 }}>
            <Link href="/login">Create a free account</Link> to keep your streak, find your political type, and add your voice to Overlap's polls.
          </p>
        )}
      </div>
    );
  }

  // ── Results ─────────────────────────────────────────────
  if (s.screen === "results") {
    const r = results;
    const headline = r.score >= 420 ? "You see clearly across the aisle." : r.score >= 300 ? "A fair read of the country." : "The divide is smaller than it looks.";
    const insight = r.over > 1 ? `On average you pictured the parties ${r.over} points further apart than they are.`
      : r.over < -1 ? `On average you pictured the parties ${-r.over} points closer than they are.`
      : "Your sense of the gap between the parties was almost exactly right.";
    return (
      <div className="col center">
        <p className="eyebrow" style={{ justifyContent: "center" }}>Overlap No. {puzzle.no}</p>
        <h2 className="title">{headline}</h2>
        <div className="big-score">{r.score}<small> / {MAX}</small></div>
        <div className="squares">
          {s.guesses.map((g, k) => <span key={k} title={TIERS[g.tier].name} style={{ background: TIERS[g.tier].color }} />)}
          <span style={{ background: r.bonusPts ? "var(--overlap)" : "var(--t5)" }} />
        </div>
        <div className="stat-row">
          <div><b>{s.guesses.filter((g) => g.tier === 0).length}</b><span>Common Ground hits</span></div>
          <div><b>{Math.round(s.guesses.reduce((a, g) => a + g.err, 0) / s.guesses.length)}</b><span>Avg. points off</span></div>
          <div><b>{r.over > 0 ? "+" : ""}{r.over}</b><span>Gap overestimate</span></div>
        </div>
        <p className="dek" style={{ fontSize: 20, maxWidth: "30ch" }}>{insight}</p>
        <div className="share-preview">{shareText()}</div>
        <div className="btn-row">
          <button className="btn btn-primary" onClick={() => {
            navigator.clipboard?.writeText(shareText()).then(() => flash("Copied to clipboard"), () => flash("Select the text above to copy it"));
          }}>Copy results</button>
          {signedIn
            ? <Link className="btn btn-ghost" href="/polls">Answer today's polls</Link>
            : <Link className="btn btn-ghost" href="/login">Save your streak</Link>}
        </div>
        {signedIn && saved && <p className="ok">Saved to your account.</p>}
        {toast && <p className="ok" role="status">{toast}</p>}
        <p className="small muted">A new puzzle arrives at midnight Eastern.</p>
      </div>
    );
  }

  // ── Bonus round ────────────────────────────────────────
  if (s.i >= puzzle.rounds.length) {
    const b = puzzle.bonus, done = s.phase === "reveal";
    const correct = s.bonusPick === b.answer;
    return (
      <div className="col">
        <Progress />
        <p className="eyebrow"><span>Round {TOTAL} · Common Ground</span><span>{running} pts</span></p>
        <h2 className="statement">{b.prompt}</h2>
        <p className="muted" style={{ margin: 0 }}>The winner has the highest support in whichever party likes it less.</p>
        <div className="opts">
          {b.options.map((o, k) => (
            <button key={o.id} className={`opt ${done ? (k === b.answer ? "correct" : k === s.bonusPick ? "wrong" : "") : ""}`}
              aria-pressed={s.bonusPick === k} disabled={done}
              onClick={() => setS({ ...s, bonusPick: k })}>
              <span>{o.statement}</span>
              {done && <span className="split"><span style={{ color: "var(--dem)" }}>D {o.d}%</span> · <span style={{ color: "var(--rep)" }}>R {o.r}%</span></span>}
            </button>
          ))}
        </div>
        {done && (
          <>
            <div className="verdict">
              <div className="score-chip" style={{ background: correct ? "var(--overlap)" : "var(--t5)" }}><b>+{correct ? 100 : 0}</b>pts</div>
              <div><h3>{correct ? "Common Ground" : "Not quite"}</h3>
                <p>{b.options[b.answer].statement} ({b.options[b.answer].d}% of Democrats, {b.options[b.answer].r}% of Republicans)</p></div>
            </div>
            <Source item={b.options[b.answer]} />
          </>
        )}
        <div className="btn-row">
          <button className="btn btn-primary" disabled={s.bonusPick === null}
            onClick={() => done ? (setS({ ...s, screen: "results" }), window.scrollTo(0, 0)) : setS({ ...s, phase: "reveal" })}>
            {done ? "See results" : "Lock in pick"}
          </button>
        </div>
      </div>
    );
  }

  // ── Regular rounds ─────────────────────────────────────
  const q = puzzle.rounds[s.i];
  if (s.phase === "guess") {
    return (
      <div className="col">
        <Progress />
        <p className="eyebrow"><span>Round {s.i + 1} of {TOTAL}</span><span>{running} pts</span></p>
        <h2 className="statement quoted">{q.statement}</h2>
        <p className="muted" style={{ margin: 0 }}>What share of each party agrees?</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <span className="track-label">Your guess</span>
          <Track d={s.gd} r={s.gr} hollow />
          <Ticks />
        </div>
        <div className="slider d">
          <div className="slider-head"><label htmlFor="sd"><b>Democrats who agree</b></label><output htmlFor="sd">{s.gd}%</output></div>
          <input id="sd" type="range" min={0} max={100} value={s.gd} onChange={(e) => setS({ ...s, gd: +e.target.value })} />
        </div>
        <div className="slider r">
          <div className="slider-head"><label htmlFor="sr"><b>Republicans who agree</b></label><output htmlFor="sr">{s.gr}%</output></div>
          <input id="sr" type="range" min={0} max={100} value={s.gr} onChange={(e) => setS({ ...s, gr: +e.target.value })} />
        </div>
        <div className="btn-row">
          <button className="btn btn-primary" onClick={() => {
            const err = Math.abs(s.gd - q.d) + Math.abs(s.gr - q.r);
            const t = tierIndex(err);
            const g: Guess = { gd: s.gd, gr: s.gr, err, pts: TIERS[t].pts, tier: t, gapGuess: Math.abs(s.gd - s.gr), gapReal: Math.abs(q.d - q.r) };
            setS({ ...s, guesses: [...s.guesses, g], phase: "reveal" });
          }}>Lock in guess</button>
        </div>
      </div>
    );
  }

  const g = s.guesses[s.i], t = TIERS[g.tier], diff = g.gapGuess - g.gapReal;
  return (
    <div className="col">
      <Progress />
      <p className="eyebrow"><span>Round {s.i + 1} of {TOTAL}</span><span>{running} pts</span></p>
      <h2 className="statement quoted">{q.statement}</h2>
      <div className="verdict">
        <div className="score-chip" style={{ background: t.color }}><b>+{t.pts}</b>pts</div>
        <div><h3>{t.name}</h3><p>Your guesses were off by {g.err} points combined.</p></div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <span className="track-label">Your guess</span>
        <Track d={g.gd} r={g.gr} hollow />
        <span className="track-label">Actual</span>
        <Track d={actualShown ? q.d : g.gd} r={actualShown ? q.r : g.gr} />
        <Ticks />
      </div>
      <div className="compare">
        <div className="cell d"><div className="lbl">Democrats</div><div className="num">{q.d}%</div><div className="small muted">You said {g.gd}%</div></div>
        <div className="cell r"><div className="lbl">Republicans</div><div className="num">{q.r}%</div><div className="small muted">You said {g.gr}%</div></div>
      </div>
      <p style={{ margin: 0 }}>
        {Math.abs(diff) <= 2 ? <>You read the gap almost exactly: <b style={{ color: "var(--overlap)" }}>{g.gapReal} points</b>.</>
          : diff > 0 ? <>You guessed a {g.gapGuess}-point gap. The real gap is <b style={{ color: "var(--overlap)" }}>{g.gapReal}</b>. The parties are closer than you thought.</>
          : <>You guessed a {g.gapGuess}-point gap. The real gap is <b style={{ color: "var(--overlap)" }}>{g.gapReal}</b>. The parties split more than you thought.</>}
      </p>
      <Source item={q} />
      <div className="btn-row">
        <button className="btn btn-primary" onClick={() => { setS({ ...s, i: s.i + 1, phase: "guess", gd: 50, gr: 50 }); window.scrollTo(0, 0); }}>
          {s.i + 1 < puzzle.rounds.length ? "Next statement" : "Final round"}
        </button>
      </div>
    </div>
  );
}
