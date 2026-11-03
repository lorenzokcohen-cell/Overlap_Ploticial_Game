"use client";
import { useState } from "react";
import Link from "next/link";
import { CATEGORIES, QUESTIONS, scoreTypology } from "@/lib/typology";
import { supabaseBrowser } from "@/lib/supabase/client";

type Latest = { category: string; econ_score: number; social_score: number; created_at: string } | null;

export function Plane({ econ, social }: { econ: number; social: number }) {
  // x: econ −8 (more government) → +8 (less); y: social −8 (change, top) → +8 (tradition, bottom)
  const x = ((econ + 8) / 16) * 100, y = ((social + 8) / 16) * 100;
  return (
    <div className="plane" role="img" aria-label={`Economic score ${econ}, social score ${social}`}>
      <div className="ax" style={{ left: "50%", top: 0, bottom: 0, width: 1 }} />
      <div className="ax" style={{ top: "50%", left: 0, right: 0, height: 1 }} />
      <span className="lab" style={{ top: 6, left: "50%", transform: "translateX(-50%)" }}>Open to change</span>
      <span className="lab" style={{ bottom: 6, left: "50%", transform: "translateX(-50%)" }}>Favors tradition</span>
      <span className="lab" style={{ left: 6, top: "50%", transform: "translateY(-120%)" }}>More government</span>
      <span className="lab" style={{ right: 6, top: "50%", transform: "translateY(-120%)" }}>Less government</span>
      <span className="you" style={{ left: `${x}%`, top: `${y}%` }} />
    </div>
  );
}

export function ResultCard({ categoryId, econ, social }: { categoryId: string; econ: number; social: number }) {
  const c = CATEGORIES[categoryId];
  if (!c) return null;
  return (
    <div className="typo-card">
      <p className="eyebrow">Your political type</p>
      <h2 className="typo-name">{c.name}</h2>
      <p className="dek" style={{ fontSize: 20 }}>{c.summary}</p>
      <p style={{ margin: 0 }}><b>What you tend to value:</b> {c.values}</p>
      <p style={{ margin: 0 }}><b>Where you overlap:</b> {c.sharesWith}</p>
      <div style={{ display: "flex", justifyContent: "center", paddingTop: 8 }}><Plane econ={econ} social={social} /></div>
    </div>
  );
}

export default function Quiz({ latest }: { latest: Latest }) {
  const [started, setStarted] = useState(false);
  const [i, setI] = useState(0);
  const [answers, setAnswers] = useState<Record<string, "a" | "b">>({});
  const [result, setResult] = useState<ReturnType<typeof scoreTypology> | null>(null);
  const [err, setErr] = useState("");

  async function finish(all: Record<string, "a" | "b">) {
    const r = scoreTypology(all);
    setResult(r);
    const supabase = supabaseBrowser();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { error } = await supabase.from("typology_results").insert({
      user_id: user.id, category: r.category.id, econ_score: r.econ, social_score: r.social, answers: all,
    });
    if (error) setErr("Your result couldn't be saved: " + error.message);
  }

  if (result) {
    return (
      <div className="col">
        <ResultCard categoryId={result.category.id} econ={result.econ} social={result.social} />
        {err && <p className="error">{err}</p>}
        <div className="btn-row">
          <Link className="btn btn-primary" href="/polls">Answer polls</Link>
          <Link className="btn btn-ghost" href="/">Play today's game</Link>
        </div>
        <p className="fine">Overlap's typology uses its own questions and categories. It is a conversation starter, not a scientific classification.</p>
      </div>
    );
  }

  if (!started) {
    return (
      <div className="col">
        <p className="eyebrow">Overlap typology</p>
        <h1 className="title" style={{ fontSize: 44 }}>Where do you fit?</h1>
        <p className="dek" style={{ fontSize: 20 }}>Sixteen quick choices place you in one of nine political types, and show where you overlap with people across the aisle.</p>
        {latest && (
          <>
            <p className="muted" style={{ margin: 0 }}>Your last result, from {new Date(latest.created_at).toLocaleDateString()}:</p>
            <ResultCard categoryId={latest.category} econ={latest.econ_score} social={latest.social_score} />
          </>
        )}
        <div className="btn-row" style={{ justifyContent: "flex-start" }}>
          <button className="btn btn-primary" onClick={() => setStarted(true)}>{latest ? "Retake the quiz" : "Start the quiz"}</button>
        </div>
        <p className="fine">For each pair, pick the statement closer to your view, even if neither is exactly right.</p>
      </div>
    );
  }

  const q = QUESTIONS[i];
  const pick = (v: "a" | "b") => {
    const next = { ...answers, [q.id]: v };
    setAnswers(next);
    if (i + 1 < QUESTIONS.length) setI(i + 1); else finish(next);
  };
  return (
    <div className="col">
      <div className="progress">{QUESTIONS.map((_, k) => <span key={k} className={k < i ? "on" : ""} />)}</div>
      <p className="eyebrow"><span>Question {i + 1} of {QUESTIONS.length}</span>{i > 0 && <button className="btn" style={{ padding: 0, fontSize: 12 }} onClick={() => setI(i - 1)}>Back</button>}</p>
      <h2 className="statement" style={{ fontSize: 26 }}>Which statement comes closer to your view?</h2>
      <div className="tq">
        {(["a", "b"] as const).map((k) => (
          <button key={k} className="opt" aria-pressed={answers[q.id] === k} onClick={() => pick(k)}>{q[k].text}</button>
        ))}
      </div>
    </div>
  );
}
